import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Bell } from "lucide-react";
import { PushNotificationState } from "../../core/simulator-engine";

interface PushNotificationBannerProps {
    notificationState: PushNotificationState | null;
    onDismiss: () => void;
    deviceStyle?: "iphone" | "android" | "none";
    theme?: "dark" | "light";
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
    notificationState,
    onDismiss,
    deviceStyle = "iphone",
    theme = "dark",
}) => {
    if (!notificationState) return null;

    const {
        title,
        text,
        app = "WhatsApp",
        avatarUrl,
        isSwipeDismissing = false,
        isFingerTapActive = false,
    } = notificationState;

    const isIos = deviceStyle === "iphone";

    return (
        <AnimatePresence>
            <motion.div
                className={`rws-push-banner-wrapper rws-push-device-${deviceStyle} rws-push-theme-${theme}`}
                initial={{ y: -70, opacity: 0, scale: 0.95 }}
                animate={
                    isSwipeDismissing
                        ? { y: isIos ? -80 : -70, x: isIos ? 0 : 120, opacity: 0, scale: 0.9 }
                        : { y: 0, x: 0, opacity: 1, scale: 1 }
                }
                exit={{ y: -70, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                onClick={onDismiss}
            >
                <div className={`rws-push-card ${isIos ? "rws-push-ios" : "rws-push-android"}`}>
                    {/* Header line for iOS / Android push */}
                    <div className="rws-push-header-row">
                        <div className="rws-push-app-badge">
                            <div className="rws-push-whatsapp-icon">
                                <MessageSquare size={13} fill="currentColor" />
                            </div>
                            <span className="rws-push-app-name">{app}</span>
                        </div>
                        <span className="rws-push-time-tag">ahora</span>
                    </div>

                    {/* Content row with Avatar & Message preview */}
                    <div className="rws-push-body-row">
                        {avatarUrl && (
                            <img src={avatarUrl} alt={title} className="rws-push-avatar" />
                        )}
                        <div className="rws-push-text-box">
                            <h4 className="rws-push-title">{title}</h4>
                            <p className="rws-push-text">{text}</p>
                        </div>
                    </div>

                    {/* Touch Swipe / Tap Finger Indicator */}
                    {(isFingerTapActive || isSwipeDismissing) && (
                        <div className={`rws-push-finger-indicator ${isSwipeDismissing ? "rws-push-swiping" : ""}`}>
                            <span className="rws-finger-circle rws-finger-pressing" />
                            <span className="rws-finger-wave" />
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
