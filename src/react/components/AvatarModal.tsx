import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Phone, Video, MessageSquare, Search, Bell, Lock, ShieldCheck, X } from "lucide-react";

interface AvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactName?: string;
    assistantName?: string;
    contactAvatarUrl?: string;
    assistantAvatarUrl?: string;
    chatType?: "direct" | "group";
    phone?: string;
    aboutText?: string;
    theme?: "dark" | "light";
    isFingerBackActive?: boolean;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
    isOpen,
    onClose,
    contactName,
    assistantName,
    contactAvatarUrl,
    assistantAvatarUrl,
    chatType = "direct",
    phone = "+54 9 11 5432-8765",
    aboutText = "¡Hola! Estoy usando WhatsApp.",
    theme = "dark",
    isFingerBackActive = false,
}) => {
    const nameToDisplay = contactName || assistantName || "RRORTEGA";
    const avatarUrl = contactAvatarUrl || assistantAvatarUrl;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={`rws-profile-modal-overlay rws-theme-${theme}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                >
                    {/* Header bar inside Profile view */}
                    <div className="rws-profile-header">
                        <button
                            type="button"
                            className="rws-profile-back-btn"
                            onClick={onClose}
                            aria-label="Volver al chat"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <span className="rws-profile-title">Info. del contacto</span>
                        <div style={{ width: 22 }} />
                    </div>

                    {/* Animated Finger Cursor on Back Button if closing step active */}
                    {isFingerBackActive && (
                        <div className="rws-finger-back-indicator">
                            <span className="rws-finger-circle rws-finger-pressing" />
                            <span className="rws-finger-wave" />
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="rws-profile-scroll-body">
                        {/* Large Avatar Photo Card */}
                        <div className="rws-profile-photo-card">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt={nameToDisplay} className="rws-profile-large-avatar" />
                            ) : (
                                <div className="rws-profile-large-fallback">
                                    <span>{nameToDisplay.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <h2 className="rws-profile-name">{nameToDisplay}</h2>
                            <p className="rws-profile-phone">{phone}</p>
                        </div>

                        {/* Quick Action Icons Bar */}
                        <div className="rws-profile-actions-bar">
                            <button type="button" className="rws-profile-action-btn" onClick={onClose}>
                                <MessageSquare size={20} />
                                <span>Mensaje</span>
                            </button>
                            <button type="button" className="rws-profile-action-btn">
                                <Phone size={20} />
                                <span>Audio</span>
                            </button>
                            <button type="button" className="rws-profile-action-btn">
                                <Video size={20} />
                                <span>Video</span>
                            </button>
                            <button type="button" className="rws-profile-action-btn">
                                <Search size={20} />
                                <span>Buscar</span>
                            </button>
                        </div>

                        {/* Status / Info Box */}
                        <div className="rws-profile-info-section">
                            <div className="rws-profile-info-row">
                                <span className="rws-profile-info-label">Info.</span>
                                <span className="rws-profile-info-val">{aboutText}</span>
                            </div>
                        </div>

                        {/* Encryption & Security section */}
                        <div className="rws-profile-info-section">
                            <div className="rws-profile-info-row rws-profile-security-row">
                                <Lock size={18} className="rws-profile-sec-icon" />
                                <div>
                                    <span className="rws-profile-info-val" style={{ fontWeight: 600 }}>
                                        Cifrado de extremo a extremo
                                    </span>
                                    <p className="rws-profile-sec-sub">
                                        Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat los puede leer.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
