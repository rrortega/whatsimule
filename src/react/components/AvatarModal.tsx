import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Phone, Video, MessageSquare, Search, Lock } from "lucide-react";

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
    locale?: "es" | "en";
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
    phone,
    aboutText,
    theme = "dark",
    locale = "es",
    isFingerBackActive = false,
}) => {
    const nameToDisplay = contactName || assistantName || "RRORTEGA";
    const avatarUrl = contactAvatarUrl || assistantAvatarUrl;

    const resolvedPhone = phone || (locale === "es" ? "+54 9 11 5432-8765" : "+1 (555) 234-5678");
    const resolvedAboutText = aboutText || (locale === "es" ? "¡Hola! Estoy usando WhatsApp." : "Hey there! I am using WhatsApp.");

    const t = {
        backLabel: locale === "es" ? "Volver al chat" : "Back to chat",
        contactInfo: locale === "es" ? "Info. del contacto" : "Contact Info",
        message: locale === "es" ? "Mensaje" : "Message",
        audio: "Audio",
        video: "Video",
        search: locale === "es" ? "Buscar" : "Search",
        about: locale === "es" ? "Info." : "About",
        encryptionTitle: locale === "es" ? "Cifrado de extremo a extremo" : "End-to-end encryption",
        encryptionDesc: locale === "es"
            ? "Los mensajes y las llamadas están cifrados de extremo a extremo. Nadie fuera de este chat los puede leer."
            : "Messages and calls are end-to-end encrypted. No one outside of this chat can read them.",
    };

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
                            aria-label={t.backLabel}
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <span className="rws-profile-title">{t.contactInfo}</span>
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
                            <p className="rws-profile-phone">{resolvedPhone}</p>
                        </div>

                        {/* Quick Action Icons Bar */}
                        <div className="rws-profile-actions-bar">
                            <button type="button" className="rws-profile-action-btn" onClick={onClose}>
                                <MessageSquare size={20} />
                                <span>{t.message}</span>
                            </button>
                            <button type="button" className="rws-profile-action-btn">
                                <Phone size={20} />
                                <span>{t.audio}</span>
                            </button>
                            <button type="button" className="rws-profile-action-btn">
                                <Video size={20} />
                                <span>{t.video}</span>
                            </button>
                            <button type="button" className="rws-profile-action-btn">
                                <Search size={20} />
                                <span>{t.search}</span>
                            </button>
                        </div>

                        {/* Status / Info Box */}
                        <div className="rws-profile-info-section">
                            <div className="rws-profile-info-row">
                                <span className="rws-profile-info-label">{t.about}</span>
                                <span className="rws-profile-info-val">{resolvedAboutText}</span>
                            </div>
                        </div>

                        {/* Encryption & Security section */}
                        <div className="rws-profile-info-section">
                            <div className="rws-profile-info-row rws-profile-security-row">
                                <Lock size={18} className="rws-profile-sec-icon" />
                                <div>
                                    <span className="rws-profile-info-val" style={{ fontWeight: 600 }}>
                                        {t.encryptionTitle}
                                    </span>
                                    <p className="rws-profile-sec-sub">
                                        {t.encryptionDesc}
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
