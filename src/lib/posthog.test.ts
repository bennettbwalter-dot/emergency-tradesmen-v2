import { beforeEach, describe, expect, it, vi } from "vitest";

type IdleCallback = () => void | Promise<void>;

const posthogMock = vi.hoisted(() => ({
  client: {
    capture: vi.fn(),
    init: vi.fn(),
    isFeatureEnabled: vi.fn(),
    onFeatureFlags: vi.fn(),
  },
  delayLoad: false,
  moduleLoads: vi.fn(),
  resolveLoad: undefined as undefined | (() => void),
}));

vi.mock("posthog-js", async () => {
  posthogMock.moduleLoads();
  if (posthogMock.delayLoad) {
    await new Promise<void>((resolve) => {
      posthogMock.resolveLoad = resolve;
    });
  }
  return { default: posthogMock.client };
});

let consent: string | null;
let idleCallbacks: IdleCallback[];

async function loadBoundary() {
  return import("./posthog");
}

async function runNextIdleCallback() {
  const callback = idleCallbacks.shift();
  expect(callback).toBeTypeOf("function");
  await callback?.();
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("VITE_POSTHOG_KEY", "test-posthog-key");
  consent = null;
  idleCallbacks = [];
  posthogMock.delayLoad = false;
  posthogMock.resolveLoad = undefined;
  posthogMock.client.isFeatureEnabled.mockReturnValue(false);
  posthogMock.client.onFeatureFlags.mockReturnValue(vi.fn());

  vi.stubGlobal("window", {
    localStorage: {
      getItem: () => consent,
    },
    requestIdleCallback: (callback: IdleCallback) => {
      idleCallbacks.push(callback);
      return idleCallbacks.length;
    },
  });
});

describe("PostHog consent boundary", () => {
  it("does not initialize or capture when consent is lost while the vendor loads", async () => {
    consent = "accepted";
    posthogMock.delayLoad = true;
    const { trackPostHogEvent } = await loadBoundary();

    trackPostHogEvent("blocked_during_load");
    const pendingIdleCallback = runNextIdleCallback();
    await vi.waitFor(() => expect(posthogMock.moduleLoads).toHaveBeenCalledTimes(1));

    consent = "declined";
    posthogMock.resolveLoad?.();
    await pendingIdleCallback;

    expect(posthogMock.client.init).not.toHaveBeenCalled();
    expect(posthogMock.client.capture).not.toHaveBeenCalled();

    consent = "accepted";
    trackPostHogEvent("captured_after_reacceptance");
    await runNextIdleCallback();

    expect(posthogMock.client.init).toHaveBeenCalledTimes(1);
    expect(posthogMock.client.capture).toHaveBeenCalledWith(
      "captured_after_reacceptance",
      undefined,
    );
  });

  it("blocks already-initialized capture after consent is no longer accepted", async () => {
    consent = "accepted";
    const { initPostHog, trackPostHogEvent, trackPostHogPageView } = await loadBoundary();

    initPostHog();
    await runNextIdleCallback();
    expect(posthogMock.client.init).toHaveBeenCalledTimes(1);

    consent = "declined";
    trackPostHogEvent("blocked_after_revocation");
    trackPostHogPageView("/blocked-after-revocation");

    expect(posthogMock.client.capture).not.toHaveBeenCalled();
  });

  it("blocks uninitialized event and page capture without consent", async () => {
    const { trackPostHogEvent, trackPostHogPageView } = await loadBoundary();

    trackPostHogEvent("blocked_event");
    trackPostHogPageView("/blocked");

    expect(idleCallbacks).toHaveLength(0);
    expect(posthogMock.moduleLoads).not.toHaveBeenCalled();
    expect(posthogMock.client.capture).not.toHaveBeenCalled();
  });

  it("returns the safe false feature-flag default without consent or vendor loading", async () => {
    const { getPostHogFeatureFlag } = await loadBoundary();

    await expect(getPostHogFeatureFlag("new-us-signup-flow")).resolves.toBe(false);

    expect(posthogMock.moduleLoads).not.toHaveBeenCalled();
    expect(posthogMock.client.isFeatureEnabled).not.toHaveBeenCalled();
  });

  it("reads the feature flag through the local boundary after consent", async () => {
    consent = "accepted";
    posthogMock.client.isFeatureEnabled.mockReturnValue(true);
    const { getPostHogFeatureFlag } = await loadBoundary();

    await expect(getPostHogFeatureFlag("new-us-signup-flow")).resolves.toBe(true);

    expect(posthogMock.client.init).toHaveBeenCalledTimes(1);
    expect(posthogMock.client.isFeatureEnabled).toHaveBeenCalledWith("new-us-signup-flow");
  });

  it("keeps a mounted feature-flag subscriber ready for later consent and delayed flags", async () => {
    const values: boolean[] = [];
    const { initPostHog, subscribePostHogFeatureFlag } = await loadBoundary();

    const unsubscribe = subscribePostHogFeatureFlag(
      "new-us-signup-flow",
      (enabled) => values.push(enabled),
    );

    expect(values).toEqual([false]);
    expect(posthogMock.moduleLoads).not.toHaveBeenCalled();

    consent = "accepted";
    initPostHog();
    await runNextIdleCallback();
    await vi.waitFor(() =>
      expect(posthogMock.client.onFeatureFlags).toHaveBeenCalledTimes(1),
    );

    posthogMock.client.isFeatureEnabled.mockReturnValue(true);
    const onFlagsReady = posthogMock.client.onFeatureFlags.mock.calls[0]?.[0];
    onFlagsReady?.();

    expect(values.at(-1)).toBe(true);
    unsubscribe();
  });

  it("reconnects a waiting subscriber after re-consent when PostHog is already initialized", async () => {
    consent = "accepted";
    posthogMock.client.isFeatureEnabled.mockReturnValue(true);
    const { initPostHog, subscribePostHogFeatureFlag } = await loadBoundary();

    initPostHog();
    await runNextIdleCallback();
    expect(posthogMock.client.init).toHaveBeenCalledTimes(1);

    consent = "declined";
    const values: boolean[] = [];
    const unsubscribe = subscribePostHogFeatureFlag(
      "new-us-signup-flow",
      (enabled) => values.push(enabled),
    );

    expect(values).toEqual([false]);
    expect(posthogMock.client.onFeatureFlags).not.toHaveBeenCalled();

    consent = "accepted";
    initPostHog();
    await vi.waitFor(() =>
      expect(posthogMock.client.onFeatureFlags).toHaveBeenCalledTimes(1),
    );

    expect(values.at(-1)).toBe(true);
    unsubscribe();
  });

  it("rechecks consent inside delayed flag callbacks and cleans up the vendor subscription", async () => {
    consent = "accepted";
    const values: boolean[] = [];
    const vendorUnsubscribe = vi.fn();
    posthogMock.client.onFeatureFlags.mockReturnValue(vendorUnsubscribe);
    const { subscribePostHogFeatureFlag } = await loadBoundary();

    const unsubscribe = subscribePostHogFeatureFlag(
      "new-us-signup-flow",
      (enabled) => values.push(enabled),
    );
    await vi.waitFor(() =>
      expect(posthogMock.client.onFeatureFlags).toHaveBeenCalledTimes(1),
    );

    consent = "declined";
    posthogMock.client.isFeatureEnabled.mockReturnValue(true);
    const onFlagsReady = posthogMock.client.onFeatureFlags.mock.calls[0]?.[0];
    onFlagsReady?.();

    expect(values).not.toContain(true);

    unsubscribe();
    expect(vendorUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
