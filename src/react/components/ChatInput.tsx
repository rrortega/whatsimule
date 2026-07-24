import React, { useRef, useEffect } from "react";
import { Smile, Paperclip, Mic, Send, Trash2, Pause } from "lucide-react";
import { AudioRecordingState } from "../../core/simulator-engine";

interface ChatInputProps {
    inputValue: string;
    attachedImage: string | null;
    audioRecording?: AudioRecordingState | null;
    sendRipple: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    attachedImage,
    audioRecording,
    sendRipple,
    placeholder = "Escribe un mensaje",
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [inputValue]);

    if (audioRecording) {
        return (
            <div className="rws-audio-recording-bar">
                {/* Top Row: Timer + Waveform + View Once badge */}
                <div className="rws-rec-top-row">
                    <div className="rws-rec-timer-box">
                        <span className="rws-rec-red-dot" />
                        <span className="rws-rec-timer">{audioRecording.timer || "0:01"}</span>
                    </div>
                    <div className="rws-rec-waveform">
                        {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 85, 50, 90, 65, 40, 80].map((h, i) => (
                            <span
                                key={i}
                                className={`rws-rec-wave-bar ${audioRecording.isPaused ? "paused" : ""}`}
                                style={{ height: `${h}%` }}
                            />
                        ))}
                    </div>
                    <div className="rws-rec-view-once" title="Ver una sola vez">
                        <span>1</span>
                    </div>
                </div>

                {/* Bottom Row: Trash icon + Long Pause/Resume pill + Green Send button */}
                <div className="rws-rec-bottom-row">
                    <button type="button" className="rws-rec-trash-btn" aria-label="Eliminar nota de voz">
                        <Trash2 size={18} />
                    </button>

                    <button type="button" className="rws-rec-pause-pill" aria-label="Pausar o Reanudar">
                        {audioRecording.isPaused ? (
                            <>
                                <Mic size={15} />
                                <span>Reanudar</span>
                            </>
                        ) : (
                            <>
                                <Pause size={15} />
                                <span>Pausar</span>
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        className={`rws-send-btn ${sendRipple ? "rws-btn-ripple" : ""}`}
                        aria-label="Enviar nota de voz"
                    >
                        <Send size={18} className="rws-send-icon" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rws-input-bar">
            <div className="rws-input-wrapper">
                <button type="button" className="rws-input-icon-btn" aria-label="Emojis">
                    <Smile size={20} className="rws-input-icon" />
                </button>
                <div className="rws-input-field-container">
                    <textarea
                        ref={textareaRef}
                        readOnly
                        rows={1}
                        value={inputValue}
                        placeholder={attachedImage ? "Enviando imagen..." : placeholder}
                        className="rws-input-field"
                    />
                    {attachedImage && (
                        <div className="rws-attached-preview">
                            <img src={attachedImage} alt="Preview" />
                        </div>
                    )}
                </div>
                <button type="button" className="rws-input-icon-btn" aria-label="Adjuntar">
                    <Paperclip size={20} className="rws-input-icon" />
                </button>
            </div>
            <button
                type="button"
                className={`rws-send-btn ${sendRipple ? "rws-btn-ripple" : ""}`}
                aria-label="Enviar"
            >
                {inputValue.length > 0 || attachedImage ? (
                    <Send size={18} className="rws-send-icon" />
                ) : (
                    <Mic size={18} className="rws-send-icon" />
                )}
            </button>
        </div>
    );
};
