import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Delete, CornerDownLeft, Smile, Settings, Mic, MoreHorizontal } from "lucide-react";

interface VirtualKeyboardProps {
    isOpen: boolean;
    pressedKey: string | null;
    deviceStyle?: "iphone" | "android" | "none";
    theme?: "dark" | "light";
}

const ROW_1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
const ROW_2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"];
const ROW_3 = ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
    isOpen,
    pressedKey,
    deviceStyle = "iphone",
    theme = "dark",
}) => {
    const isPressed = (key: string) => {
        if (!pressedKey) return false;
        const upper = pressedKey.toUpperCase();
        if (key === "SHIFT" && upper === "SHIFT") return true;
        if (key === "BACKSPACE" && upper === "BACKSPACE") return true;
        if (key === "SPACE" && (upper === " " || upper === "SPACE")) return true;
        if (key === "SEND" && (upper === "SEND" || upper === "ENTER")) return true;
        return upper === key;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                    style={{ overflow: "hidden" }}
                    className={`rws-virtual-keyboard rws-kb-theme-${theme} rws-kb-device-${deviceStyle}`}
                >
                    <motion.div
                        initial={{ y: 24 }}
                        animate={{ y: 0 }}
                        exit={{ y: 24 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                    {/* Gboard Android Top Toolbar */}
                    {deviceStyle === "android" && (
                        <div className="rws-gboard-toolbar">
                            <button type="button" className="rws-gboard-tool-btn" aria-label="Stickers">
                                <Smile size={16} />
                            </button>
                            <button type="button" className="rws-gboard-tool-btn" aria-label="Ajustes">
                                <Settings size={16} />
                            </button>
                            <button type="button" className="rws-gboard-tool-btn" aria-label="Micrófono">
                                <Mic size={16} />
                            </button>
                            <button type="button" className="rws-gboard-tool-btn" aria-label="Más opciones">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    )}

                    {/* Key Row 1 */}
                    <div className="rws-kb-row">
                        {ROW_1.map((k) => (
                            <button
                                key={k}
                                type="button"
                                className={`rws-kb-key ${isPressed(k) ? "rws-kb-key-active" : ""}`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>

                    {/* Key Row 2 */}
                    <div className="rws-kb-row rws-kb-row-padded">
                        {ROW_2.map((k) => (
                            <button
                                key={k}
                                type="button"
                                className={`rws-kb-key ${isPressed(k) ? "rws-kb-key-active" : ""}`}
                            >
                                {k}
                            </button>
                        ))}
                    </div>

                    {/* Key Row 3 */}
                    <div className="rws-kb-row">
                        <button
                            type="button"
                            className={`rws-kb-key rws-kb-special ${isPressed("SHIFT") ? "rws-kb-key-active" : ""}`}
                        >
                            <ArrowUp size={16} />
                        </button>
                        {ROW_3.filter((k) => k !== "SHIFT" && k !== "BACKSPACE").map((k) => (
                            <button
                                key={k}
                                type="button"
                                className={`rws-kb-key ${isPressed(k) ? "rws-kb-key-active" : ""}`}
                            >
                                {k}
                            </button>
                        ))}
                        <button
                            type="button"
                            className={`rws-kb-key rws-kb-special ${isPressed("BACKSPACE") ? "rws-kb-key-active" : ""}`}
                        >
                            <Delete size={16} />
                        </button>
                    </div>

                    {/* Key Row 4 (Spacebar & Actions) */}
                    <div className="rws-kb-row rws-kb-bottom-row">
                        <button type="button" className="rws-kb-key rws-kb-special rws-kb-mod">
                            {deviceStyle === "android" ? "?123" : "123"}
                        </button>
                        {deviceStyle === "android" && (
                            <button type="button" className="rws-kb-key rws-kb-special rws-kb-comma">
                                ,
                            </button>
                        )}
                        <button
                            type="button"
                            className={`rws-kb-key rws-kb-space ${isPressed("SPACE") ? "rws-kb-key-active" : ""}`}
                        >
                            {deviceStyle === "android" ? "Español" : "espacio"}
                        </button>
                        {deviceStyle === "android" && (
                            <button type="button" className="rws-kb-key rws-kb-special rws-kb-dot">
                                .
                            </button>
                        )}
                        <button
                            type="button"
                            className={`rws-kb-key rws-kb-send ${isPressed("SEND") ? "rws-kb-key-active" : ""}`}
                        >
                            {deviceStyle === "android" ? (
                                <CornerDownLeft size={16} />
                            ) : (
                                <>
                                    <CornerDownLeft size={14} />
                                    <span>Ir</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    );
};
