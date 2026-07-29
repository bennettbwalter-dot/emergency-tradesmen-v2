import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowRight, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PhoneCaptureModalProps {
  trade: string;
  city: string;
  country: string;
  onDismiss: () => void;
}

export function PhoneCaptureModal({ trade, city, country, onDismiss }: PhoneCaptureModalProps) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setStatus("loading");

    try {
      const siteUrl = window.location.origin;
      const { error } = await supabase.functions.invoke("send-sms", {
        body: { phone: phone.trim(), trade, city, country, siteUrl },
      });
      if (error) throw error;
      setStatus("sent");
      setTimeout(onDismiss, 2000);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />

      <div className="relative w-full sm:max-w-md mx-auto bg-[#0A0A0A] border border-white/10 rounded-t-3xl sm:rounded-2xl p-8 shadow-2xl">
        {/* Gold accent line */}
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">We can confirm a pro for you</h2>
          </div>
        </div>

        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          Leave your number and we will text you when a local expert is confirmed.
          You can also skip to listings.
        </p>

        {status === "sent" ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
              <Phone className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white font-semibold">We will text you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                Your phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={country === "GB" ? "07700 900123" : "(555) 000-0000"}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-colors"
                autoFocus
              />
            </div>

            {status === "error" && (
              <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
            )}

            <Button
              type="submit"
              disabled={!phone.trim() || status === "loading"}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl py-3 transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Confirm a pro for me"}
            </Button>
          </form>
        )}

        <button
          onClick={onDismiss}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          Skip <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
