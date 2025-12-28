import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react'; // Changed Mic -> Volume
import { AzureVoiceService } from '@/services/azureVoiceService';

const VoiceTrigger = () => {
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('Silent');
    // Singleton-ish service ref
    const [voiceService] = useState(() => new AzureVoiceService());

    const toggleVoice = async () => {
        // Haptic
        if (typeof navigator.vibrate === 'function') navigator.vibrate(50);

        if (isActive) {
            voiceService.stop();
            setIsActive(false);
            setStatus('Silent');
        } else {
            setStatus('Initializing...');

            // MOBILE UNLOCK: Init AudioContext on User Gesture
            voiceService.unlockAudioContext();
            setIsActive(true);
            setStatus('Ready');

            // Quick Test Speak
            await voiceService.speak("Voice navigation active. <break time='200ms'/> Ready.");
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-center gap-3">
            {isActive && (
                <div className="bg-black/80 backdrop-blur-md text-gold text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold/30 shadow-2xl animate-in fade-in zoom-in duration-300">
                    {status}
                </div>
            )}

            <button
                onClick={toggleVoice}
                className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive
                        ? 'bg-gradient-to-br from-gold via-amber-400 to-gold text-black border-2 border-gold shadow-gold/50'
                        : 'bg-slate-900/40 backdrop-blur-xl border border-white/10 text-gold hover:border-gold/50 hover:bg-slate-900/60'
                    }
                `}
            >
                {status === 'Initializing...' ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                ) : isActive ? (
                    <Volume2 className="w-7 h-7" />
                ) : (
                    <VolumeX className="w-7 h-7" />
                )}
            </button>
        </div>
    );
};

export default VoiceTrigger;
