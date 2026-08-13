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
        engineRef.current = new WhatsAppSimulatorEngine({ ...options, customScripts: scripts }, handlers);
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

    useEffect(() => {
        if (engineRef.current && scripts) {
            engineRef.current.setCustomScripts(scripts);
        }
    }, [scripts]);

    useEffect(() => {
        if (engineRef.current && handlers) {
            engineRef.current.setHandlers(handlers);
        }
    }, [handlers]);

    const activeScriptId = state.activeScriptId || Object.keys(scripts)[0] || "";

    const startScript = (scriptId: string, startIndex?: number) => {
        engineRef.current?.startScript(scriptId, scripts, startIndex);
    };

    const restartCurrentScript = () => {
        const targetScriptId = activeScriptId || Object.keys(scripts)[0] || "";
        if (targetScriptId) {
            startScript(targetScriptId, 0);
        }
    };

    const restart = () => {
        restartCurrentScript();
    };

    useEffect(() => {
        if (activeScriptId && scripts[activeScriptId]) {
            startScript(activeScriptId);
        }
    }, [activeScriptId]);

    const setPerspective = (
        perspectiveOrX?: any,
        rotateY?: number,
        rotateZ?: number,
        zoom?: number,
        duration?: number
    ) => engineRef.current?.setPerspective(perspectiveOrX, rotateY, rotateZ, zoom, duration);

    const resetPerspective = () => engineRef.current?.resetPerspective();
    const goToStep = (index: number) => engineRef.current?.goToStep(index);
    const jumpToStep = (index: number) => engineRef.current?.jumpToStep(index);
    const nextStep = () => engineRef.current?.nextStep();
    const previousStep = () => engineRef.current?.previousStep();
    const play = () => engineRef.current?.play();
    const resume = () => engineRef.current?.resume();
    const pause = () => engineRef.current?.pause();
    const stop = () => engineRef.current?.stop();
    const setSpeedMultiplier = (speed: number) => engineRef.current?.setSpeedMultiplier(speed);
    const setSpeed = (speed: number) => engineRef.current?.setSpeed(speed);
    const setScript = (scriptId: string, startIndex?: number) => engineRef.current?.setScript(scriptId, startIndex);
    const openAvatarModal = () => engineRef.current?.openAvatarModal();
    const closeAvatarModal = () => engineRef.current?.closeAvatarModal();
    const toggleAvatarModal = () => engineRef.current?.toggleAvatarModal();

    return {
        state,
        activeScriptId,
        engine: engineRef.current,
        startScript,
        restartCurrentScript,
        setPerspective,
        resetPerspective,
        goToStep,
        jumpToStep,
        nextStep,
        previousStep,
        play,
        resume,
        pause,
        stop,
        restart,
        setSpeedMultiplier,
        setSpeed,
        setScript,
        openAvatarModal,
        closeAvatarModal,
        toggleAvatarModal,
    };
}
