import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <SEO title="Page Not Found" noIndex />
      <div className="text-center">
        <img src="/et-logo-new.webp" alt="Emergency Trades Logo" loading="lazy" className="w-20 h-20 mx-auto mb-6 rounded-full object-cover border-2 border-gold/50" />
        <p className="mb-2 text-4xl font-bold">404</p>
        <h1 className="mb-4 text-xl text-muted-foreground">Page Not Found</h1>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
