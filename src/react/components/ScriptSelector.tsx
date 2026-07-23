import React from "react";
import { ChatScript } from "../../core/types";

interface ScriptSelectorProps {
    scripts: Record<string, ChatScript>;
    activeScriptId: string;
    onSelectScript: (scriptId: string) => void;
}

export const ScriptSelector: React.FC<ScriptSelectorProps> = ({
    scripts,
    activeScriptId,
    onSelectScript,
}) => {
    const scriptKeys = Object.keys(scripts);
    if (scriptKeys.length === 0) return null;

    return (
        <div className="rws-script-selector">
            {scriptKeys.map((id) => {
                const script = scripts[id];
                const isActive = id === activeScriptId;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onSelectScript(id)}
                        className={`rws-script-chip ${isActive ? "rws-chip-active" : ""}`}
                    >
                        {script.icon && <span className="rws-chip-icon">{script.icon}</span>}
                        <span className="rws-chip-label">{script.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
