
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2, AlertCircle, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState('hi-IN');
    const [transcript, setTranscript] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !isRecording && !isProcessing) {
                e.preventDefault();
                startRecording();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && isRecording) {
                e.preventDefault();
                stopRecording();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isRecording, isProcessing]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = handleUpload;

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied. Please allow permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleUpload = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        try {
            const res = await api.sendVoiceInput({ audioFile: blob, textInput: '' });
            if (res.original_input) {
                setTranscript(res.original_input);
                onTranscript(res.original_input);
            }
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to process audio. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto relative z-10">

            {/* Animated Ring when Recording */}
            {isRecording && (
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                    <div className="w-32 h-32 bg-red-500/20 rounded-full animate-ping"></div>
                    <div className="w-48 h-48 bg-red-500/10 rounded-full animate-ping delay-100"></div>
                </div>
            )}

            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px] bg-white border-border/50 shadow-sm rounded-full h-10">
                    <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="hi-IN">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="en-IN">English</SelectItem>
                    <SelectItem value="bho-IN">Bhojpuri (भोजपुरी)</SelectItem>
                </SelectContent>
            </Select>

            {/* Main Button */}
            <div className="relative group">
                <Button
                    variant={isRecording ? "destructive" : "default"}
                    size="icon"
                    className={cn(
                        "h-24 w-24 rounded-full shadow-2xl transition-all duration-300 z-10 relative flex flex-col items-center justify-center gap-1 border-4 border-white",
                        isRecording ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-gradient-to-br from-brand-saffron to-brand-teal hover:scale-105"
                    )}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="h-10 w-10 animate-spin text-white" />
                    ) : isRecording ? (
                        <Square className="h-8 w-8 fill-white text-white" />
                    ) : (
                        <Mic className="h-10 w-10 text-white" />
                    )}
                </Button>
            </div>

            {/* Waveform Visualization (Mock) */}
            {isRecording && (
                <div className="flex items-center justify-center gap-1 h-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-1 bg-red-500 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ height: `${10 + (i * 5) % 20}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            )}

            {/* Status Text / Transcript */}
            <div className="text-center space-y-2 min-h-[3rem] w-full">
                {error ? (
                    <p className="text-red-500 text-sm flex items-center justify-center gap-2 bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="h-4 w-4" /> {error}
                    </p>
                ) : isProcessing ? (
                    <p className="text-brand-teal animate-pulse font-medium">Processing your voice...</p>
                ) : isRecording ? (
                    <p className="text-red-500 font-medium">Listening... Press Space to Stop</p>
                ) : transcript ? (
                    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-border/50 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                        <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">You said:</p>
                        <p className="text-foreground font-medium text-lg leading-relaxed">"{transcript}"</p>
                        <div className="mt-2 flex justify-center">
                            <Button variant="ghost" size="sm" onClick={() => setTranscript('')} className="text-xs h-6 text-muted-foreground hover:text-brand-saffron">Clear</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">Tap microphone or hold Space to speak</p>
                )}
            </div>
        </div>
    );
};
