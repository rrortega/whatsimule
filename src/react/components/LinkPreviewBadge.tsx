import React, { useState, useEffect } from "react";
import { Globe, ExternalLink } from "lucide-react";
import { LinkPreviewData } from "../../core/types";

interface LinkPreviewBadgeProps {
    linkUrl: string;
    previewData?: LinkPreviewData;
}

// In-memory cache for OpenGraph fetch results across message bubbles
const ogCache: Record<string, LinkPreviewData> = {};

export const LinkPreviewBadge: React.FC<LinkPreviewBadgeProps> = ({ linkUrl, previewData }) => {
    const [data, setData] = useState<LinkPreviewData | null>(() => {
        if (previewData) return previewData;
        if (ogCache[linkUrl]) return ogCache[linkUrl];
        return null;
    });
    const [loading, setLoading] = useState<boolean>(!previewData && !ogCache[linkUrl]);

    useEffect(() => {
        if (previewData) {
            setData(previewData);
            setLoading(false);
            return;
        }

        if (ogCache[linkUrl]) {
            setData(ogCache[linkUrl]);
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        const fetchOpenGraph = async () => {
            try {
                const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(linkUrl)}`);
                if (!response.ok) throw new Error("OG fetch failed");
                const result = await response.json();

                if (result.status === "success" && result.data) {
                    const parsed: LinkPreviewData = {
                        url: linkUrl,
                        title: result.data.title || "",
                        description: result.data.description || "",
                        image: result.data.image?.url || "",
                        siteName: result.data.publisher || "",
                    };
                    ogCache[linkUrl] = parsed;
                    if (isMounted) {
                        setData(parsed);
                        setLoading(false);
                    }
                } else {
                    throw new Error("No data");
                }
            } catch (err) {
                let domain = linkUrl;
                try {
                    domain = new URL(linkUrl).hostname.replace(/^www\./, '');
                } catch (e) { }

                const fallback: LinkPreviewData = {
                    url: linkUrl,
                    title: domain,
                    description: linkUrl,
                    siteName: domain
                };
                ogCache[linkUrl] = fallback;
                if (isMounted) {
                    setData(fallback);
                    setLoading(false);
                }
            }
        };

        fetchOpenGraph();

        return () => {
            isMounted = false;
        };
    }, [linkUrl, previewData]);

    const getDomain = (urlStr: string) => {
        try {
            return new URL(urlStr).hostname.replace(/^www\./, '');
        } catch (e) {
            return urlStr;
        }
    };

    const domain = getDomain(linkUrl);

    if (loading) {
        return (
            <div className="rws-og-card rws-og-skeleton">
                <div className="rws-og-info">
                    <span className="rws-og-domain">
                        <Globe size={12} /> {domain}
                    </span>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rws-og-card"
            onClick={(e) => e.stopPropagation()}
        >
            {data.image && (
                <div className="rws-og-image-box">
                    <img src={data.image} alt={data.title || domain} className="rws-og-image" />
                </div>
            )}
            <div className="rws-og-info">
                {data.title && <div className="rws-og-title">{data.title}</div>}
                {data.description && <div className="rws-og-desc">{data.description}</div>}
                <div className="rws-og-domain">
                    <Globe size={12} />
                    <span>{data.siteName || domain}</span>
                    <ExternalLink size={10} style={{ marginLeft: "auto", opacity: 0.7 }} />
                </div>
            </div>
        </a>
    );
};
