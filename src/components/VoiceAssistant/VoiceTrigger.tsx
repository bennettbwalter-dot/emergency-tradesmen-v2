import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import VoiceAssistantModal from './VoiceAssistantModal';

const VoiceTrigger: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 group font-medium text-sm md:text-base"
                aria-label="Talk to Emergency Assistant"
            >
                <div className="bg-white/20 p-1.5 rounded-full">
                    <Mic className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />
                </div>
                <span className="hidden md:inline">Voice Assistant</span>
                <span className="md:hidden">Assistant</span>
            </button>

            <VoiceAssistantModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default VoiceTrigger;
