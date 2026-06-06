import { handleLiveAlertsRequest } from "../../src/lib/alerts/server";

export const onRequestGet: PagesFunction = async ({ request }) => {
  return handleLiveAlertsRequest(request);
};

