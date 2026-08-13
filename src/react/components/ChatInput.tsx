import React, { useRef, useEffect } from "react";
import { Smile, Paperclip, Mic, Send, Trash2, Pause } from "lucide-react";
import { AudioRecordingState } from "../../core/simulator-engine";

interface ChatInputProps {
    inputValue: string;
    attachedImage: string | null;
    audioRecording?: AudioRecordingState | null;
    sendRipple: boolean;
    placeholder?: string;
    isKeyboardOpen?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    attachedImage,
    audioRecording,
    sendRipple,
    placeholder = "Escribe un mensaje",
    isKeyboardOpen = false,
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
                        {[40, 75, 35, 90, 60, 100, 45, 80, 55, 95, 35, 70, 85, 50, 90, 65, 40, 80, 60, 85, 45, 75].map((h, i, arr) => {
                            const currentProgress = audioRecording.progress ?? 0;
                            const barThreshold = (i / arr.length) * 100;
                            const isRecorded = barThreshold <= currentProgress;
                            return (
                                <span
                                    key={i}
                                    className={`rws-rec-wave-bar ${audioRecording.isPaused ? "paused" : ""} ${isRecorded ? "recorded" : "pending"}`}
                                    style={{
                                        height: isRecorded ? `${h}%` : "16%",
                                        opacity: isRecorded ? 1 : 0.3,
                                    }}
                                />
                            );
                        })}
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
        <div className="rws-input-bar" style={{ position: "relative" }}>
            <div className="rws-input-wrapper">
                <button type="button" className="rws-input-icon-btn" aria-label="Emojis">
                    <Smile size={20} className="rws-input-icon" />
                </button>
                <div className="rws-input-field-container" style={{ position: "relative" }}>
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
                    {isKeyboardOpen && inputValue.length === 0 && (
                        <div className="rws-finger-avatar-indicator" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
                            <span className="rws-finger-circle rws-finger-pressing" />
                            <span className="rws-finger-wave" />
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
