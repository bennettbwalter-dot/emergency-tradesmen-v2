
import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { VoiceAssistantModal } from './VoiceAssistantModal';

const VoiceTrigger = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-5 py-3 
                         bg-primary text-primary-foreground font-semibold rounded-full 
                         shadow-lg hover:bg-primary/90 transition-all duration-200
                         animate-in fade-in slide-in-from-bottom-5"
            >
                <Mic className="w-5 h-5" />
                <span>Concierge AI</span>
            </button>

            <VoiceAssistantModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

export default VoiceTrigger;
