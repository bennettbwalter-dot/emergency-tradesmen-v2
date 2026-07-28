# Content automation consent amendment

Date: 2026-07-28

## Decision

The user chose an absolute analytics-consent boundary over Task 2's original four-file limit.

PostHog must not load its vendor module, initialize, capture page views or events, or read feature flags unless `cookieConsent` is exactly `accepted`.

## Required boundary

- Re-check consent before loading PostHog.
- Re-check consent after asynchronous vendor loading and immediately before initialization, capture, or feature-flag reads.
- Treat missing, declined, unknown, or revoked consent as denied.
- Resolve feature flags to the safe default `false` before consent without importing `posthog-js` or `posthog-js/react`.
- Persist accepted consent before requesting PostHog initialization.

## Scope amendment

The approved privacy rule permits Task 2 to modify `src/pages/AuthPage.tsx` and add focused helpers and regression tests beyond the original four files. This amendment does not authorize unrelated analytics or authentication refactors.
