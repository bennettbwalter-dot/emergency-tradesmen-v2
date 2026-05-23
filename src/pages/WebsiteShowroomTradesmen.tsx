import { useLocation } from "react-router-dom";
import { WebsiteShowroom } from "@/components/business/WebsiteShowroom";

export default function WebsiteShowroomTradesmen() {
  const { pathname } = useLocation();
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" ? window.location.port : "";
  const isUSDomain =
    hostname.includes("emergencycontractors.net") ||
    (hostname === "localhost" && port === "3001") ||
    (hostname === "127.0.0.1" && port === "3001");
  const isUSPath = pathname.startsWith("/for-contractors");
  const region = isUSDomain || isUSPath ? "US" : "UK";
  return <WebsiteShowroom region={region} />;
}
