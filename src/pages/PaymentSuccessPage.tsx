import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import confetti from "canvas-confetti";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmail } from "@/lib/email";

export default function PaymentSuccessPage() {
    const { user } = useAuth();
    const hasSentRef = useRef(false);

    useEffect(() => {
        // Fire confetti on load
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        // Send Email Notification (once per session)
        const sessionKey = `payment_email_sent_${new Date().toISOString().split('T')[0]}`;
        if (!hasSentRef.current && !sessionStorage.getItem(sessionKey)) {
            hasSentRef.current = true;
            sessionStorage.setItem(sessionKey, 'true');

            // 1. Alert Admin
            sendEmail({
                to: "emergencytradesmen@outlook.com",
                subject: "💰 New PRO Subscription Purchased!",
                text: `Likely new PRO subscription from ${user?.email || 'Unknown User'}.\n\nPlease check Stripe Dashboard to confirm payment.`
            });

            // 2. Receipt to User
            if (user?.email) {
                sendEmail({
                    to: user.email,
                    subject: "Welcome to Premium - Emergency Tradesmen",
                    text: `Hi ${user.name},\n\nThank you for upgrading to Pro! Your payment was successful.\n\nYou now have access to:\n- Priority Ranking\n- Featured Badge\n- Lead Notifications\n\nGo to your dashboard to set up your profile: https://emergencytradesmen.net/user/dashboard`
                });
            }
        }

        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-100">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
                    <p className="text-slate-600 mb-8 text-lg">
                        Thank you for upgrading. Your subscription is now active, and you have access to all premium features.
                    </p>

                    <div className="space-y-4">
                        <Link to="/user/dashboard">
                            <Button className="w-full h-12 text-base" size="lg">
                                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>

                        <Link to="/">
                            <Button variant="outline" className="w-full">
                                Return to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
