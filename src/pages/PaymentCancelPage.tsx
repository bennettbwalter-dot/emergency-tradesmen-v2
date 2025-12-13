import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Cancelled</h1>
                    <p className="text-slate-600 mb-8 text-lg">
                        No worries! No charge was made. You can try again whenever you're ready to upgrade to Pro.
                    </p>

                    <div className="space-y-4">
                        <Link to="/pricing">
                            <Button className="w-full h-12 text-base" size="lg">
                                Return to Pricing
                            </Button>
                        </Link>

                        <Link to="/user/dashboard">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 w-4 h-4" /> Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
