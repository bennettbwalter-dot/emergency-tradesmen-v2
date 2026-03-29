import { useState, useEffect, useRef } from 'react';

interface TypewriterMessageProps {
    text: string;
    speed?: number;
    onType?: () => void;
    onComplete?: () => void;
}

export function TypewriterMessage({
    text,
    speed = 15,
    onType,
    onComplete
}: TypewriterMessageProps) {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);
    const textRef = useRef(text);

    // If text changes drastically (new message), reset.
    // However, in our use case, text content for a specific message ID shouldn't change.
    // We'll rely on the parent to unmount/remount if usage key changes, or just handle simple prop change.

    useEffect(() => {
        // Reset if text prop changes to something completely different? 
        // For simplicity, we assume this component is mounted once per message.
        // If text changes, we want to update.
        if (text !== textRef.current) {
            textRef.current = text;
            indexRef.current = 0;
            setDisplayedText("");
        }
    }, [text]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (indexRef.current < textRef.current.length) {
                const nextChar = textRef.current.charAt(indexRef.current);
                setDisplayedText((prev) => prev + nextChar);
                indexRef.current++;
                if (onType) onType();
            } else {
                clearInterval(intervalId);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [speed, onType, onComplete]);

    return <>{displayedText}</>;
}
