import React from "react";
import { ExternalLink } from "lucide-react";

interface LinkPreviewBadgeProps {
    linkUrl: string;
    label?: string;
}

export const LinkPreviewBadge: React.FC<LinkPreviewBadgeProps> = ({ linkUrl, label = "Ver reporte interactivo" }) => {
    return (
        <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rws-link-preview-badge"
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <div className="rws-link-preview-icon">
                <ExternalLink size={14} />
            </div>
            <div className="rws-link-preview-info">
                <span className="rws-link-preview-title">{label}</span>
                <span className="rws-link-preview-url">{linkUrl}</span>
            </div>
        </a>
    );
};
