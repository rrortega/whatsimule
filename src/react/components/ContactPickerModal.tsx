import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Check, Send, X } from "lucide-react";
import { ContactPickerState } from "../../core/simulator-engine";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface ContactPickerModalProps {
    pickerState: ContactPickerState | null;
    locale?: "es" | "en";
    theme?: "dark" | "light";
    deviceStyle?: "iphone" | "android" | "none";
}

export const ContactPickerModal: React.FC<ContactPickerModalProps> = ({
    pickerState,
    locale = "es",
    theme = "dark",
    deviceStyle = "iphone",
}) => {
    if (!pickerState?.isOpen) return null;

    const contacts = pickerState.contacts || [];
    const query = pickerState.searchQuery || "";
    const selected = pickerState.selectedContact;

    const filteredContacts = [...contacts]
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.phone && c.phone.includes(query))
        );

    const colors = ["#00a884", "#34b7f1", "#e542a3", "#9c27b0", "#ff9800", "#4caf50"];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`rws-contact-picker-screen rws-theme-${theme}`}
            >
                {/* Header Bar */}
                <div className="rws-contact-picker-header">
                    <div className="rws-contact-header-top">
                        <button type="button" className="rws-contact-back-btn" aria-label="Atrás">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="rws-contact-header-title">
                            <h3>{locale === "es" ? "Enviar contactos" : "Send contacts"}</h3>
                            {selected && (
                                <span className="rws-contact-selected-count">
                                    {locale === "es" ? "1 seleccionado" : "1 selected"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search Bar Input */}
                    <div className="rws-contact-search-bar">
                        <Search size={17} className="rws-contact-search-icon" />
                        <input
                            type="text"
                            readOnly
                            value={query}
                            placeholder={locale === "es" ? "Buscar..." : "Search..."}
                            className="rws-contact-search-input"
                        />
                        {query.length > 0 && (
                            <X size={16} className="rws-contact-search-clear" />
                        )}

                        {pickerState.isFingerClickingSearch && (
                            <div className="rws-finger-indicator" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                                <span className="rws-finger-circle rws-finger-pressing" />
                                <span className="rws-finger-wave" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact List */}
                <div className="rws-contact-picker-body">
                    {filteredContacts.map((contact, idx) => {
                        const isTargetSelected = selected?.name === contact.name;
                        const initial = contact.name.charAt(0).toUpperCase();
                        const bg = colors[idx % colors.length];

                        return (
                            <div
                                key={contact.name}
                                className={`rws-contact-item-row ${isTargetSelected ? "selected" : ""}`}
                            >
                                <div className="rws-contact-item-avatar" style={{ backgroundColor: contact.avatarUrl ? "transparent" : bg }}>
                                    {contact.avatarUrl ? (
                                        <img src={contact.avatarUrl} alt={contact.name} />
                                    ) : (
                                        <span>{initial}</span>
                                    )}
                                </div>

                                <div className="rws-contact-item-info">
                                    <div className="rws-contact-item-name">{contact.name}</div>
                                    <div className="rws-contact-item-sub">
                                        {contact.organization || contact.phone || "+52 55 9876 5432"}
                                    </div>
                                </div>

                                <div className={`rws-contact-checkbox ${isTargetSelected ? "checked" : ""}`}>
                                    {isTargetSelected && <Check size={14} strokeWidth={3} color="#ffffff" />}
                                </div>

                                {isTargetSelected && pickerState.isFingerClickingItem && (
                                    <div className="rws-finger-indicator" style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)" }}>
                                        <span className="rws-finger-circle rws-finger-pressing" />
                                        <span className="rws-finger-wave" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Send Action Button */}
                {selected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="rws-contact-floating-send-box"
                    >
                        <button type="button" className="rws-contact-send-btn" aria-label="Enviar contacto">
                            <Send size={20} className="rws-contact-send-icon" />
                            {pickerState.isFingerClickingSend && (
                                <div className="rws-finger-indicator" style={{ position: "absolute", inset: 0 }}>
                                    <span className="rws-finger-circle rws-finger-pressing" />
                                    <span className="rws-finger-wave" />
                                </div>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* Virtual Keyboard */}
                <VirtualKeyboard
                    isOpen={Boolean(pickerState.isKeyboardOpen)}
                    pressedKey={pickerState.pressedKey || null}
                    deviceStyle={deviceStyle}
                    theme={theme}
                    locale={locale}
                />
            </motion.div>
        </AnimatePresence>
    );
};
