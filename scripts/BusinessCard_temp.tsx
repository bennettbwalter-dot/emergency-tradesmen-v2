
import { Link } from "react-router-dom";
import { Mail, Star, MapPin, Phone, ShieldCheck, Zap, Heart, MessageSquareQuote, Factory, Wrench, TrendingUp, Clock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
// import { db } from "@/lib/db"; // Commented out to prevent crashes for now
import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "./AuthModal";
import { Business } from "@/lib/businesses";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/components/ui/use-toast"; // Changed to useToast hook
import { trackEvent } from "@/lib/analytics";

interface BusinessCardProps {
 business: Business;
 rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
 const { isAuthenticated } = useAuth();
 const [liked, setLiked] = useState(false);
 const { addToComparison, removeFromComparison, isInComparison } = useComparison(); // Fixed destructuring
 const { toast } = useToast();

 const inComparison = isInComparison(business.id); // Fixed usage

 // Trade Icon Logic
 let TradeIcon = Wrench;
 if (business.trade === 'electrician') TradeIcon = Zap;
 if (business.trade === 'plumber') TradeIcon = Wrench;
 if (business.trade === 'locksmith') TradeIcon = Key;
 if (business.trade === 'glazier') TradeIcon = Factory;

 // Just use Wrench as default if unknown
 const tradeName = business.trade ? business.trade.charAt(0).toUpperCase() + business.trade.slice(1) : "Tradesperson";

 const handleFavorite = async () => {
 if (!isAuthenticated) return;
 // Mock functionality for now
 setLiked(!liked);
 };

 // Availability Logic
 const isAvailable = true; // For emergency trades, default to available or use logic

 // Check real-time availability (Live Ping)
 const lastPing = business.last_available_ping ? new Date(business.last_available_ping) : null;
 const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
 const isLive = lastPing && lastPing > oneHourAgo;

 const showAvailable = isLive || business.isOpen24Hours || isAvailable;

 const isPaid = business.is_premium || business.tier === 'paid' || (business.priority_score && business.priority_score > 0);

 return (
 <div
 className={`group relative bg-card rounded-lg border hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-[shadow,border-color,transform] duration-300 overflow-hidden h-full flex flex-col ${isPaid
 ? "border-emerald-500 shadow-xl shadow-emerald-500/10 bg-gradient-to-br from-card via-card to-gold/5 ring-1 ring-gold/20"
 : "border-border/50 hover:border-emerald-500/30"
 }`}
 >
 {/* Rank badge / Featured Badge */}
 <div className={`absolute top-4 left-4 z-10 rounded-full flex items-center justify-center ${isPaid
 ? "px-3 h-7 bg-emerald-500 text-black font-bold text-xs uppercase tracking-wide shadow-md"
 : "w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 font-display text-emerald-500 font-bold"
 }`}>
 {isPaid ? (
 <span className="flex items-center gap-1">
 <Zap className="w-3 h-3 fill-black" />
 Featured
 </span>
 ) : (
 <span>{rank}</span>
 )}
 </div>

 {/* Favorite Button */}
 <div className="absolute top-4 right-4 z-10">
 {isAuthenticated ? (
 <Button
 variant="ghost"
 size="icon"
 className={`rounded-full hover:bg-emerald-500/10 ${liked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-emerald-500'}`}
 onClick={(e) => { e.preventDefault(); handleFavorite(); }}
 >
 <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
 </Button>
 ) : (
 <AuthModal
 trigger={
 <Button
 variant="ghost"
 size="icon"
 className="rounded-full text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
 >
 <Heart className="w-5 h-5" />
 </Button>
 }
 defaultTab="register"
 />
 )}
 </div>

 <div className="p-6 pt-16 flex-1 flex flex-col">
 {/* Business name - Fixed height for alignment */}
 <div className="h-[3.5rem] mb-3 pr-4 flex items-start">
 <h3 className="font-display text-xl tracking-wide text-foreground leading-tight line-clamp-2">
 <Link to={`/business/${business.id}`} className="hover:text-emerald-500 transition-colors">
 {business.name}
 </Link>
 </h3>
 </div>

 {/* Rating section */}
 <div className="flex items-center gap-3 mb-4 h-6">
 <div className="flex items-center gap-1.5">
 <Star className="w-4 h-4 fill-gold text-emerald-500" />
 <span className="font-semibold text-foreground">{business.rating.toFixed(1)}</span>
 </div>
 <span className="text-sm text-muted-foreground truncate">
 ({business.reviewCount} {business.reviewCount === 1 ? 'review' : 'reviews'})
 </span>
 {showAvailable ? (
 <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium uppercase tracking-wider bg-green-500/10 text-green-500 rounded-full border border-green-500/30 whitespace-nowrap">
 <span className="relative flex h-2 w-2">
 <motion.span
 animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
 transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
 className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
 
 />
 <motion.span
 animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
 transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
 className="relative inline-flex rounded-full h-2 w-2"
 
 />
 </span>
 <motion.span
 animate={{ color: ["#D4AF37", "#FFFFFF"] }}
 transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
 
 >
 {isLive ? "Live Now" : "Available Now"}
 </motion.span>
 </span>
 ) : (
 <span className="ml-auto px-3 py-1 text-xs font-medium uppercase tracking-wider bg-red-500/10 text-red-500 rounded-full border border-red-500/30 whitespace-nowrap">
 Closed
 </span>
 )}
 </div>

 {/* Business details - Enforce strict line heights/truncation */}
 <div className="space-y-2.5 mb-5 text-sm h-[80px]">
 <div className="flex items-start gap-2.5 text-muted-foreground h-5">
 <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500/70" />
 <span className="truncate">{business.address || "Serving your area"}</span>
 </div>
 <div className="flex items-center gap-2.5 text-muted-foreground h-5">
 <Clock className="w-4 h-4 flex-shrink-0 text-emerald-500/70" />
 <span className="truncate">{business.hours || "24/7 Emergency"}</span>
 </div>
 {business.rating >= 4.8 && (
 <div className="flex items-center gap-2.5 text-emerald-500 h-5">
 <ShieldCheck className="w-4 h-4 flex-shrink-0" />
 <span>Smart Price Guarantee</span>
 </div>
 )}
 </div>

 {/* Featured review - Fixed height container */}
 <div className="mb-5 h-[4.5rem] overflow-hidden">
 {business.featuredReview ? (
 <div className="p-3 bg-secondary/30 rounded-lg border border-border/30 h-full">
 <div className="flex gap-2 items-start h-full">
 <MessageSquareQuote className="w-4 h-4 text-emerald-500/70 flex-shrink-0 mt-0.5" />
 <p className="text-sm text-muted-foreground italic line-clamp-2 leading-relaxed">
 "{business.featuredReview}"
 </p>
 </div>
 </div>
 ) : (
 <div className="h-full" /> // Placeholder to maintain alignment
 )}
 </div>

 {/* Action buttons */}
 <div className="space-y-2 mt-auto">
 {/* PRIMARY: Phone Call */}
 <div className="h-11">
 {business.phone ? (
 <Button
 asChild
 variant="default"
 className="w-full bg-gradient-to-r from-emerald-500 to-yellow-500 hover:from-yellow-400 hover:to-gold text-black font-bold border-0 h-11"
 onClick={() => trackEvent("Business", "Call Now", `${business.name} (${business.id})`)}
 >
 <a href={`tel:${business.phone}`} className="flex items-center justify-center gap-2">
 <Phone className="w-5 h-5" />
 📞 CALL NOW
 </a>
 </Button>
 ) : (
 <Button
 variant="secondary"
 className="w-full cursor-not-allowed opacity-50 h-11"
 disabled
 >
 <span className="flex items-center justify-center gap-2">
 <Phone className="w-5 h-5" />
 No Phone Available
 </span>
 </Button>
 )}
 </div>

 {/* SECONDARY: WhatsApp */}
 <div className="h-10">
 {business.phone && (
 <Button
 asChild
 className="w-full bg-green-500 hover:bg-green-600 text-white h-10"
 onClick={() => trackEvent("Business", "WhatsApp Click", `${business.name} (${business.id})`)}
 >
 <a
 href={`https://wa.me/${(business.whatsapp_number || business.phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I found ${business.name} on Emergency Tradesmen and would like to enquire about your services.`)}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2"
 >
 💬 WhatsApp Now
 </a>
 </Button>
 )}
 </div>

 {/* WEBSITE LINK - Spacer used if missing to align other buttons */}
 <div className="h-10">
 {business.website ? (
 <Button
 asChild
 variant="outline"
 className="w-full border-blue-500/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700 h-10"
 onClick={() => trackEvent("Business", "Website Click", `${business.name} (${business.id})`)}
 >
 <a
 href={business.website}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2"
 >
 🌐 Visit Website
 </a>
 </Button>
 ) : (
 // Spacer to ensure card height consistency
 <div className="w-full h-10" />
 )}
 </div>

 {/* TERTIARY ACTIONS */}
 <div className="grid grid-cols-1 gap-2 pt-1 h-9">
 {/* EMAIL BUTTON REMOVED per user request */}

 <Button
 variant="outline"
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 if (inComparison) {
 removeFromComparison(business.id);
 toast({ title: "Removed from comparison" });
 } else {
 addToComparison(business.id);
 toast({ title: "Added to comparison" });
 }
 }}
 className={`border-border/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground text-xs h-9 w-full ${inComparison ? 'bg-secondary border-border' : ''}`}
 >
 <TrendingUp className="w-3 h-3 mr-1" />
 {inComparison ? 'Added' : 'Compare'}
 </Button>
 </div>
 </div>

 </div>

 {/* Hover effect overlay */}
 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
 </div>
 );
}

