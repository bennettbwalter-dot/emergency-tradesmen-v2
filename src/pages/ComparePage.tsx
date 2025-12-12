import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PriceComparison } from "@/components/PriceComparison";
import { useSearchParams } from "react-router-dom";

export default function ComparePage() {
    const [searchParams] = useSearchParams();
    const tradeName = searchParams.get("trade") || "electrician";

    return (
        <>
            <Helmet>
                <title>Compare Prices - Emergency Tradesmen UK</title>
                <meta
                    name="description"
                    content="Compare prices from multiple emergency tradespeople. See transparent pricing, call-out fees, and hourly rates side-by-side."
                />
            </Helmet>

            <Header />

            <main className="min-h-screen bg-background py-12">
                <div className="container max-w-7xl">
                    <PriceComparison tradeName={tradeName} />
                </div>
            </main>

            <Footer />
        </>
    );
}
