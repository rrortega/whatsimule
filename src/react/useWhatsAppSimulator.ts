import { useState, useEffect, useRef, useMemo } from "react";
import { WhatsAppSimulatorEngine, SimulatorState } from "../core/simulator-engine";
import { WhatsAppSimulatorOptions, SimulatorEventHandlers, ChatScript } from "../core/types";

export function useWhatsAppSimulator(
    scripts: Record<string, ChatScript>,
    options: WhatsAppSimulatorOptions = {},
    handlers: SimulatorEventHandlers = {}
) {
    const engineRef = useRef<WhatsAppSimulatorEngine | null>(null);

    if (!engineRef.current) {
        engineRef.current = new WhatsAppSimulatorEngine(options, handlers);
    }

    const [state, setState] = useState<SimulatorState>(() => engineRef.current!.getState());

    useEffect(() => {
        const engine = engineRef.current;
        if (!engine) return;

        const unsubscribe = engine.subscribe((newState) => {
            setState(newState);
        });

        return () => {
            unsubscribe();
            engine.clearAllTimers();
        };
    }, []);

    const activeScriptId = state.activeScriptId || Object.keys(scripts)[0] || "";

    const startScript = (scriptId: string) => {
        engineRef.current?.startScript(scriptId, scripts);
    };

    const restartCurrentScript = () => {
        if (activeScriptId) {
            startScript(activeScriptId);
        }
    };

    useEffect(() => {
        if (activeScriptId && scripts[activeScriptId]) {
            startScript(activeScriptId);
        }
    }, [activeScriptId]);

    return {
        state,
        activeScriptId,
        startScript,
        restartCurrentScript,
    };
}
