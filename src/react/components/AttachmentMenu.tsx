import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Camera, MapPin, User, FileText, BarChart2, Calendar, Sparkles } from "lucide-react";
import { AttachmentMenuState } from "../../core/simulator-engine";

interface AttachmentMenuProps {
    menuState: AttachmentMenuState | null;
    locale?: "es" | "en";
    theme?: "dark" | "light";
}

const GALLERY_PREVIEWS = [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150&auto=format&fit=crop&q=80",
];

const ThumbnailTile: React.FC<{ src: string; index: number }> = ({ src, index }) => {
    const [hasError, setHasError] = useState(false);

    return (
        <div className="rws-gallery-strip-item">
            {!hasError ? (
                <img
                    src={src}
                    alt={`Thumbnail ${index + 1}`}
                    onError={() => setHasError(true)}
                />
            ) : (
                <div className="rws-gallery-placeholder">
                    <Image size={18} className="rws-gallery-placeholder-icon" />
                </div>
            )}
        </div>
    );
};

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
    menuState,
    locale = "es",
    theme = "dark",
}) => {
    const isOpen = Boolean(menuState?.isOpen);

    const options = [
        {
            id: "galeria",
            label: locale === "es" ? "Galería" : "Gallery",
            icon: Image,
            iconColor: "#34b7f1",
        },
        {
            id: "camara",
            label: locale === "es" ? "Cámara" : "Camera",
            icon: Camera,
            iconColor: "#e542a3",
        },
        {
            id: "ubicacion",
            label: locale === "es" ? "Ubicación" : "Location",
            icon: MapPin,
            iconColor: "#00a884",
        },
        {
            id: "contacto",
            label: locale === "es" ? "Contacto" : "Contact",
            icon: User,
            iconColor: "#0088cc",
        },
        {
            id: "documento",
            label: locale === "es" ? "Documento" : "Document",
            icon: FileText,
            iconColor: "#9c27b0",
        },
        {
            id: "encuesta",
            label: locale === "es" ? "Encuesta" : "Poll",
            icon: BarChart2,
            iconColor: "#ff9800",
        },
        {
            id: "evento",
            label: locale === "es" ? "Evento" : "Event",
            icon: Calendar,
            iconColor: "#ea4335",
        },
        {
            id: "ia_images",
            label: locale === "es" ? "Imágenes de IA" : "AI Images",
            icon: Sparkles,
            iconColor: "#00a884",
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    style={{ overflow: "hidden" }}
                    className={`rws-attachment-menu-panel rws-theme-${theme}`}
                >
                    <motion.div
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        exit={{ y: 20 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="rws-attachment-menu-content"
                    >
                        {/* Drag Handle Bar */}
                        <div className="rws-attachment-handle-wrapper">
                            <span className="rws-attachment-handle-bar" />
                        </div>

                        {/* 4x2 Options Grid */}
                        <div className="rws-attachment-grid">
                            {options.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = menuState?.activeOption === opt.id;
                                const isFingerOnThis = isSelected && menuState?.isFingerClickingOption;

                                return (
                                    <div key={opt.id} className="rws-attachment-item-wrapper">
                                        <div className={`rws-attachment-pill ${isSelected ? "rws-option-active" : ""}`}>
                                            <Icon size={22} color={opt.iconColor} className="rws-attachment-icon" />

                                            {isFingerOnThis && (
                                                <div className="rws-finger-indicator" style={{ position: "absolute", inset: 0 }}>
                                                    <span className="rws-finger-circle rws-finger-pressing" />
                                                    <span className="rws-finger-wave" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="rws-attachment-label">{opt.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Recent Gallery Images Preview Strip */}
                        <div className="rws-attachment-gallery-strip">
                            {GALLERY_PREVIEWS.map((src, i) => (
                                <ThumbnailTile key={i} src={src} index={i} />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
