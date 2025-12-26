import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceAssistantModal from './VoiceAssistantModal';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceTrigger: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-20 md:right-24 z-[99] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center transition-all duration-300 border-2 border-white/20"
                aria-label="Talk to Emergency Assistant"
            >
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                <Mic className="w-6 h-6 text-white" />
            </motion.button>

            <VoiceAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default VoiceTrigger;
