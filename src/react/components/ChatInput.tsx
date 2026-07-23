import React from "react";
import { Smile, Paperclip, Mic, Send } from "lucide-react";

interface ChatInputProps {
    inputValue: string;
    attachedImage: string | null;
    sendRipple: boolean;
    placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    inputValue,
    attachedImage,
    sendRipple,
    placeholder = "Escribe un mensaje",
}) => {
    return (
        <div className="rws-input-bar">
            <div className="rws-input-wrapper">
                <button type="button" className="rws-input-icon-btn" aria-label="Emojis">
                    <Smile className="w-5 h-5" />
                </button>
                <div className="rws-input-field-container">
                    <input
                        type="text"
                        readOnly
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
                    <Paperclip className="w-5 h-5" />
                </button>
            </div>
            <button
                type="button"
                className={`rws-send-btn ${sendRipple ? "rws-btn-ripple" : ""}`}
                aria-label="Enviar"
            >
                {inputValue.length > 0 || attachedImage ? (
                    <Send className="w-5 h-5 text-white" />
                ) : (
                    <Mic className="w-5 h-5 text-white" />
                )}
            </button>
        </div>
    );
};
