import React from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, Shield, Zap, Search, MessageSquare, HardHat, Clock, CreditCard, UserCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const faqData = [
    {
        question: "What is Emergency Tradesmen?",
        answer: "Emergency Tradesmen is a platform that helps you quickly find and contact trusted local tradespeople for urgent problems such as plumbing, electrical faults, gas issues, lockouts, broken windows, drainage problems, and emergency breakdowns.",
        icon: <HelpCircle className="w-5 h-5 text-gold" />
    },
    {
        question: "How does the service work?",
        answer: "You can either use the chatbot to describe your emergency, or search manually by trade and location. We’ll guide you to the right local tradesperson so you can call and get help immediately.",
        icon: <Search className="w-5 h-5 text-gold" />
    },
    {
        question: "What does the AI chatbot do?",
        answer: "Our AI assistant helps you: Understand what to do (and what not to do) in an emergency, follow basic safety guidance and regulations, identify the correct trade for your situation, and navigate the site and connect you to the right local tradesperson. You can simply talk to the bot — no searching required.",
        icon: <MessageSquare className="w-5 h-5 text-gold" />
    },
    {
        question: "Is the chatbot safe to use in emergencies?",
        answer: "Yes. The chatbot is designed to prioritise safety, follow UK safety rules and best practices, avoid giving dangerous DIY instructions, and encourage calling a qualified professional when needed. It provides guidance, not repairs.",
        icon: <Shield className="w-5 h-5 text-gold" />
    },
    {
        question: "Does the chatbot replace calling a tradesperson?",
        answer: "No. The chatbot helps guide and route you, but the final step is always direct contact with a professional. Once the right tradesperson is found, you simply tap to call.",
        icon: <Zap className="w-5 h-5 text-gold" />
    },
    {
        question: "What trades are covered?",
        answer: "Emergency Tradesmen covers: Emergency plumbers, Emergency electricians, Gas engineers, Locksmiths, Glaziers, Drain specialists, Emergency breakdown and roadside recovery services. All focused on urgent call-outs.",
        icon: <HardHat className="w-5 h-5 text-gold" />
    },
    {
        question: "Do I need to fill in forms or create an account?",
        answer: "No. There are no long forms and no required sign-ups. The goal is speed — find help and call straight away.",
        icon: <UserCheck className="w-5 h-5 text-gold" />
    },
    {
        question: "How fast can someone respond?",
        answer: "Response times depend on availability and location, but many tradespeople offer 30–60 minute emergency response where possible.",
        icon: <Clock className="w-5 h-5 text-gold" />
    },
    {
        question: "Is Emergency Tradesmen free to use?",
        answer: "Yes. Searching and contacting tradespeople is free for users. Tradespeople can choose optional premium plans for increased visibility.",
        icon: <CreditCard className="w-5 h-5 text-gold" />
    },
    {
        question: "Are the tradespeople verified?",
        answer: "Listings include verified details, reviews, and trust signals where available. Always speak directly with the tradesperson to confirm availability and pricing.",
        icon: <UserCheck className="w-5 h-5 text-gold" />
    },
    {
        question: "What should I do if my situation is dangerous?",
        answer: "If there is immediate danger to life or property (such as fire, gas leaks, or serious injury), always contact emergency services first. The chatbot will also advise this when appropriate.",
        icon: <AlertTriangle className="w-5 h-5 text-gold" />
    }
];

interface GeneralFAQSectionProps {
    className?: string;
    showTitle?: boolean;
    useContainer?: boolean;
    initiallyOpened?: boolean;
}

export function GeneralFAQSection({
    className = "",
    showTitle = true,
    useContainer = false,
    initiallyOpened = false
}: GeneralFAQSectionProps) {
    const [isOpened, setIsOpened] = React.useState(true);

    const content = (
        <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-border/30">
                        <AccordionTrigger className="hover:no-underline py-5 text-left text-foreground font-medium">
                            <div className="flex items-center gap-4">
                                {faq.icon}
                                <span className="text-lg">{faq.question}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pl-9 pb-6">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );

    return (
        <div className={`w-full max-w-4xl mx-auto ${className}`}>
            

            {!showTitle && !isOpened && (
                <div className="text-center mb-8">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpened(true)}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-primary font-bold transition-all duration-300"
                    >
                        <HelpCircle className="w-5 h-5" />
                        Frequently Asked Questions
                    </motion.button>
                </div>
            )}

            <motion.div
                initial={initiallyOpened ? false : { opacity: 0, height: 0, y: 20 }}
                animate={isOpened ? { opacity: 1, height: "auto", y: 0 } : { opacity: 0, height: 0, y: 20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="overflow-hidden"
            >
                {useContainer ? (
                    <div className="relative overflow-hidden rounded-lg border border-gold/30 bg-card p-10 md:p-16 mb-20">
                        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
                        <div className="relative z-10">
                            {content}
                        </div>
                    </div>
                ) : (
                    <div className="mb-10">
                        {content}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
