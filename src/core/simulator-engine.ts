import { Message, ScriptStep, ChatScript, WhatsAppSimulatorOptions, SimulatorEventHandlers, StepPerspective } from "./types";
import { playKeyClickSound, playSentSound, playReceiveSound } from "./audio-synth";

export type StateListener = (state: SimulatorState) => void;

export interface MediaPreviewState {
    imageUrl: string;
    captionText: string;
    isKeyboardOpen?: boolean;
    pressedKey?: string | null;
}

export interface AudioRecordingState {
    isRecording: boolean;
    timer: string;
    isPaused: boolean;
    progress: number;
}

export interface SimulatorState {
    activeScriptId: string;
    messages: Message[];
    isTyping: boolean;
    isRecordingAudio: boolean;
    inputValue: string;
    sendRipple: boolean;
    attachedImage: string | null;
    mediaPreview: MediaPreviewState | null;
    audioRecording: AudioRecordingState | null;
    elapsedTime: number;
    totalDuration: number;
    isComplete: boolean;
    isKeyboardOpen: boolean;
    pressedKey: string | null;
    activeStepPerspective?: StepPerspective | null;
    customPerspective?: StepPerspective | null;
    isPaused?: boolean;
    currentStepIndex?: number;
    speedMultiplier?: number;
}

export class WhatsAppSimulatorEngine {
    private options: WhatsAppSimulatorOptions;
    private handlers: SimulatorEventHandlers;
    private listeners: Set<StateListener> = new Set();

    private activeRunId: number = 0;
    private timeoutIds: ReturnType<typeof setTimeout>[] = [];
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private isPausedState: boolean = false;

    private state: SimulatorState;

    constructor(
        options: WhatsAppSimulatorOptions = {},
        handlers: SimulatorEventHandlers = {}
    ) {
        this.options = options;
        this.handlers = handlers;

        const scripts = options.customScripts || {};
        const firstScriptId = Object.keys(scripts)[0] || "";

        this.state = {
            activeScriptId: options.defaultActiveScriptId || firstScriptId,
            messages: [],
            isTyping: false,
            isRecordingAudio: false,
            inputValue: "",
            sendRipple: false,
            attachedImage: null,
            mediaPreview: null,
            audioRecording: null,
            elapsedTime: 0,
            totalDuration: 0,
            isComplete: false,
            isKeyboardOpen: false,
            pressedKey: null,
            isPaused: false,
            currentStepIndex: 0,
            speedMultiplier: options.speedMultiplier || 1,
        };
    }

    public subscribe(listener: StateListener): () => void {
        this.listeners.add(listener);
        listener(this.state);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public getState(): SimulatorState {
        return this.state;
    }

    private updateState(partial: Partial<SimulatorState>): void {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach((listener) => listener(this.state));
    }

    public calculateScriptDuration(script: ChatScript): number {
        if (!script || !script.steps) return 0;
        return script.steps.reduce((acc, step) => {
            let typingDelay = 0;
            if ((step.sender === "resident" || step.sender === "user") && step.type === "text") {
                typingDelay = step.content.length * 13 + 750;
            }
            return acc + step.delay + typingDelay;
        }, 0);
    }

    public clearAllTimers(): void {
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.timeoutIds = [];
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private createMessageFromStep(step: ScriptStep, id: string, timestamp: string): Message {
        return {
            id,
            sender: step.sender,
            type: step.type,
            content: step.content || "",
            timestamp,
            senderName: step.senderName,
            senderAvatarUrl: step.senderAvatarUrl,
            senderColor: step.senderColor,
            caption: step.caption,
            audioDuration: step.audioDuration || "0:14",
            audioUrl: step.audioUrl,
            linkPreview: step.linkPreview,
            perspective: step.perspective,
        };
    }

    public startScript(
        scriptId: string,
        scriptsOrStartIndex?: Record<string, ChatScript> | number,
        overrideStartIndex?: number
    ): void {
        this.clearAllTimers();
        this.activeRunId++;
        const currentRunId = this.activeRunId;

        let scripts: Record<string, ChatScript> = this.options.customScripts || {};
        let startIndexOverride: number | undefined = overrideStartIndex;

        if (typeof scriptsOrStartIndex === "object" && scriptsOrStartIndex !== null) {
            scripts = scriptsOrStartIndex;
        } else if (typeof scriptsOrStartIndex === "number") {
            startIndexOverride = scriptsOrStartIndex;
        }

        const script = scripts[scriptId];
        if (!script) return;

        const rawInitialIndex = startIndexOverride ?? this.options.initialStepIndex ?? 0;
        const startIndex = Math.max(0, Math.min(rawInitialIndex, Math.max(0, script.steps.length - 1)));

        const initialMessages: Message[] = [];
        const now = new Date();

        for (let i = 0; i < startIndex; i++) {
            const step = script.steps[i];
            const pastTime = new Date(now.getTime() - (startIndex - i) * 60000);
            const timestamp = `${pastTime.getHours().toString().padStart(2, "0")}:${pastTime.getMinutes().toString().padStart(2, "0")}`;
            initialMessages.push(this.createMessageFromStep(step, `${script.id}-initial-${i}`, timestamp));
        }

        const lastInitialStep = startIndex > 0 ? script.steps[startIndex - 1] : null;

        const totalDuration = this.calculateScriptDuration(script);
        this.updateState({
            activeScriptId: scriptId,
            messages: initialMessages,
            isTyping: false,
            inputValue: "",
            attachedImage: null,
            elapsedTime: 0,
            totalDuration,
            isComplete: false,
            isPaused: false,
            currentStepIndex: startIndex,
            activeStepPerspective: lastInitialStep?.perspective || null,
        });

        this.handlers.onScriptChange?.(scriptId);

        // Progress timer
        const stepTime = 50;
        this.intervalId = setInterval(() => {
            if (this.isPausedState) return;
            if (this.state.elapsedTime >= totalDuration) {
                if (this.intervalId) clearInterval(this.intervalId);
                return;
            }
            this.updateState({ elapsedTime: this.state.elapsedTime + stepTime });
        }, stepTime);

        this.runScriptAsync(script, currentRunId, startIndex);
    }

    private async sleep(ms: number): Promise<void> {
        const checkInterval = 50;
        let elapsed = 0;
        while (elapsed < ms) {
            if (this.isPausedState) {
                await new Promise((r) => setTimeout(r, checkInterval));
                continue;
            }
            const speed = this.options.speedMultiplier && this.options.speedMultiplier > 0 ? this.options.speedMultiplier : 1;
            const stepMs = Math.max(10, Math.round(checkInterval * speed));
            await new Promise((r) => {
                const id = setTimeout(r, checkInterval);
                this.timeoutIds.push(id);
            });
            elapsed += stepMs;
        }
    }

    private async runScriptAsync(script: ChatScript, runId: number, startIndexParam?: number): Promise<void> {
        const rawInitialIndex = startIndexParam ?? this.options.initialStepIndex ?? 0;
        const startIndex = Math.max(0, Math.min(rawInitialIndex, Math.max(0, script.steps.length - 1)));

        for (let i = startIndex; i < script.steps.length; i++) {
            if (this.activeRunId !== runId) return;
            this.updateState({ currentStepIndex: i });
            if (this.activeRunId !== runId) return;

            const step = script.steps[i];
            const nextStep = script.steps[i + 1];

            if (step.perspective) {
                this.updateState({ activeStepPerspective: step.perspective });
            }

            if (nextStep?.perspective && step.delay >= 400) {
                const halfDelay = Math.floor(step.delay / 2);
                await this.sleep(halfDelay);
                if (this.activeRunId !== runId) return;
                this.updateState({ activeStepPerspective: nextStep.perspective });
                await this.sleep(step.delay - halfDelay);
            } else {
                await this.sleep(step.delay);
            }
            if (this.activeRunId !== runId) return;

            const isUserSender = step.sender === "resident" || step.sender === "user";

            if (isUserSender) {
                if (step.type === "text") {
                    const isKeyboard = this.options.typingMode === "keyboard";
                    if (isKeyboard) {
                        this.updateState({ isKeyboardOpen: true });
                        await this.sleep(300);
                        if (this.activeRunId !== runId) return;
                    }

                    let currentText = "";
                    const midpointChar = Math.floor(step.content.length / 2);
                    for (let charIndex = 0; charIndex < step.content.length; charIndex++) {
                        if (this.activeRunId !== runId) return;

                        if (charIndex === midpointChar && nextStep?.perspective) {
                            this.updateState({ activeStepPerspective: nextStep.perspective });
                        }

                        const char = step.content[charIndex];
                        currentText += char;
                        this.updateState({
                            inputValue: currentText,
                            pressedKey: isKeyboard ? char.toUpperCase() : null,
                        });

                        if (this.options.enableSound !== false && this.options.soundTyping !== false) {
                            playKeyClickSound();
                        }
                        const charDelay = isKeyboard ? 40 + Math.random() * 30 : 8 + Math.random() * 10;
                        await this.sleep(charDelay);
                    }

                    if (isKeyboard) {
                        this.updateState({ pressedKey: null });
                        await this.sleep(250);
                    } else {
                        await this.sleep(200);
                    }
                    if (this.activeRunId !== runId) return;

                    this.updateState({ sendRipple: true });
                    if (this.options.enableSound !== false && this.options.soundSent !== false) {
                        playSentSound();
                    }
                    await this.sleep(150);
                    this.updateState({ sendRipple: false, isKeyboardOpen: false, pressedKey: null });
                    if (this.activeRunId !== runId) return;

                    const now = new Date();
                    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

                    const newMessage: Message = {
                        id: `${script.id}-${i}`,
                        sender: step.sender,
                        type: step.type,
                        content: step.content,
                        timestamp,
                        senderName: step.senderName,
                        senderAvatarUrl: step.senderAvatarUrl,
                        senderColor: step.senderColor,
                        linkPreview: step.linkPreview,
                        perspective: step.perspective,
                    };

                    this.updateState({
                        messages: [...this.state.messages, newMessage],
                        inputValue: "",
                    });
                    this.handlers.onMessageSent?.(newMessage);

                    await this.sleep(400);
                } else if (step.type === "image") {
                    // Open WhatsApp Media Preview Screen (Full screen preview inside frame)
                    const isKeyboard = this.options.typingMode === "keyboard";

                    this.updateState({
                        mediaPreview: {
                            imageUrl: step.content,
                            captionText: "",
                            isKeyboardOpen: false,
                            pressedKey: null,
                        }
                    });
                    await this.sleep(400);
                    if (this.activeRunId !== runId) return;

                    // If step has a caption, type caption in media preview screen
                    if (step.caption) {
                        if (isKeyboard) {
                            this.updateState({
                                mediaPreview: {
                                    imageUrl: step.content,
                                    captionText: "",
                                    isKeyboardOpen: true,
                                    pressedKey: null,
                                }
                            });
                            await this.sleep(300);
                            if (this.activeRunId !== runId) return;

                            let currentCaption = "";
                            for (let charIndex = 0; charIndex < step.caption.length; charIndex++) {
                                if (this.activeRunId !== runId) return;
                                const char = step.caption[charIndex];
                                currentCaption += char;
                                this.updateState({
                                    mediaPreview: {
                                        imageUrl: step.content,
                                        captionText: currentCaption,
                                        isKeyboardOpen: true,
                                        pressedKey: char.toUpperCase(),
                                    }
                                });
                                if (this.options.enableSound !== false && this.options.soundTyping !== false) {
                                    playKeyClickSound();
                                }
                                const charDelay = 35 + Math.random() * 25;
                                await this.sleep(charDelay);
                            }
                            this.updateState({
                                mediaPreview: {
                                    imageUrl: step.content,
                                    captionText: currentCaption,
                                    isKeyboardOpen: false,
                                    pressedKey: null,
                                }
                            });
                            await this.sleep(250);
                        } else {
                            this.updateState({
                                mediaPreview: {
                                    imageUrl: step.content,
                                    captionText: step.caption,
                                    isKeyboardOpen: false,
                                    pressedKey: null,
                                }
                            });
                            await this.sleep(600);
                        }
                    } else {
                        await this.sleep(500);
                    }
                    if (this.activeRunId !== runId) return;

                    // Click Send Button in Media Preview
                    this.updateState({ sendRipple: true });
                    if (this.options.enableSound !== false && this.options.soundSent !== false) {
                        playSentSound();
                    }
                    await this.sleep(150);
                    this.updateState({ mediaPreview: null, sendRipple: false });
                    if (this.activeRunId !== runId) return;

                    // Message appears in chat stream with blur + circular progress ring
                    const now = new Date();
                    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
                    const messageId = `${script.id}-${i}`;

                    const imageMessage: Message = {
                        id: messageId,
                        sender: step.sender,
                        type: step.type,
                        content: step.content,
                        timestamp,
                        isUploading: true,
                        uploadProgress: 10,
                        senderName: step.senderName,
                        senderAvatarUrl: step.senderAvatarUrl,
                        senderColor: step.senderColor,
                        caption: step.caption,
                        perspective: step.perspective,
                    };

                    this.updateState({
                        messages: [...this.state.messages, imageMessage],
                    });
                    this.handlers.onMessageSent?.(imageMessage);

                    // Circular ring fills up from 10% to 100%
                    const progressSteps = [30, 60, 85, 100];
                    for (let p = 0; p < progressSteps.length; p++) {
                        await this.sleep(300);
                        if (this.activeRunId !== runId) return;

                        const progress = progressSteps[p];
                        this.updateState({
                            messages: this.state.messages.map((m) =>
                                m.id === messageId
                                    ? { ...m, uploadProgress: progress, isUploading: progress < 100 }
                                    : m
                            ),
                        });
                    }
                    await this.sleep(400);
                } else if (step.type === "audio") {
                    // Activate WhatsApp Hands-Free Voice Recording Bar with live progressive waveform
                    const totalDurationMs = 3500;
                    const intervalMs = 100;
                    const totalSteps = totalDurationMs / intervalMs;

                    for (let s = 1; s <= totalSteps; s++) {
                        if (this.activeRunId !== runId) return;

                        const progress = Math.min(100, Math.round((s / totalSteps) * 100));
                        const currentSec = Math.floor((s * intervalMs) / 1000);
                        const timer = `0:0${currentSec}`;

                        this.updateState({
                            audioRecording: {
                                isRecording: true,
                                timer,
                                isPaused: false,
                                progress,
                            }
                        });

                        if (s % 4 === 0 && this.options.enableSound !== false && this.options.soundTyping !== false) {
                            playKeyClickSound();
                        }
                        await this.sleep(intervalMs);
                    }
                    if (this.activeRunId !== runId) return;

                    // Pause moment (recording completed)
                    this.updateState({
                        audioRecording: {
                            isRecording: true,
                            timer: "0:03",
                            isPaused: true,
                            progress: 100,
                        }
                    });
                    await this.sleep(400);
                    if (this.activeRunId !== runId) return;

                    // Click Send Button
                    this.updateState({ sendRipple: true });
                    if (this.options.enableSound !== false && this.options.soundSent !== false) {
                        playSentSound();
                    }
                    await this.sleep(150);
                    this.updateState({ audioRecording: null, sendRipple: false });
                    if (this.activeRunId !== runId) return;

                    const now = new Date();
                    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

                    const audioMessage: Message = {
                        id: `${script.id}-${i}`,
                        sender: step.sender,
                        type: "audio",
                        content: step.content || "",
                        timestamp,
                        senderName: step.senderName,
                        senderAvatarUrl: step.senderAvatarUrl,
                        senderColor: step.senderColor,
                        audioDuration: step.audioDuration || "0:14",
                        audioUrl: step.audioUrl,
                        perspective: step.perspective,
                    };

                    this.updateState({
                        messages: [...this.state.messages, audioMessage],
                    });
                    this.handlers.onMessageSent?.(audioMessage);
                    await this.sleep(400);
                }
            } else {
                // Assistant step
                if (step.type === "audio") {
                    this.updateState({ isRecordingAudio: true, isTyping: false });
                } else {
                    this.updateState({ isTyping: true, isRecordingAudio: false });
                }
                const halfTypingTime = 700;
                await this.sleep(halfTypingTime);
                if (this.activeRunId !== runId) return;
                if (nextStep?.perspective) {
                    this.updateState({ activeStepPerspective: nextStep.perspective });
                }
                await this.sleep(1400 - halfTypingTime);
                if (this.activeRunId !== runId) return;

                this.updateState({ isTyping: false, isRecordingAudio: false });
                if (this.options.enableSound !== false && this.options.soundReceive !== false) {
                    playReceiveSound();
                }

                const now = new Date();
                const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

                const assistantMessage: Message = {
                    id: `${script.id}-${i}`,
                    sender: step.sender,
                    type: step.type,
                    content: step.content,
                    timestamp,
                    senderName: step.senderName,
                    senderAvatarUrl: step.senderAvatarUrl,
                    senderColor: step.senderColor,
                    caption: step.caption,
                    audioDuration: step.audioDuration || "0:14",
                    audioUrl: step.audioUrl,
                    perspective: step.perspective,
                };

                this.updateState({
                    messages: [...this.state.messages, assistantMessage],
                });
                this.handlers.onMessageSent?.(assistantMessage);
            }
        }

        if (this.activeRunId === runId) {
            this.updateState({ isComplete: true });
            this.handlers.onScriptComplete?.(script.id);
            this.handlers.onComplete?.(script.id);
        }
    }

    public setPerspective(
        perspectiveOrX?: StepPerspective | number,
        rotateY?: number,
        rotateZ?: number,
        zoom?: number,
        duration?: number
    ): void {
        if (typeof perspectiveOrX === "object" && perspectiveOrX !== null) {
            this.updateState({ customPerspective: perspectiveOrX });
        } else if (typeof perspectiveOrX === "number") {
            this.updateState({
                customPerspective: {
                    rotateX: perspectiveOrX,
                    rotateY: rotateY,
                    rotateZ: rotateZ,
                    zoom: zoom,
                    duration: duration,
                },
            });
        } else {
            this.updateState({ customPerspective: null });
        }
    }

    public resetPerspective(): void {
        this.updateState({ customPerspective: null });
    }

    public goToStep(index: number): void {
        const scriptId = this.state.activeScriptId;
        this.startScript(scriptId, index);
    }

    public jumpToStep(index: number): void {
        this.goToStep(index);
    }

    public nextStep(): void {
        const currentIndex = this.state.currentStepIndex ?? 0;
        this.goToStep(currentIndex + 1);
    }

    public previousStep(): void {
        const currentIndex = this.state.currentStepIndex ?? 0;
        this.goToStep(Math.max(0, currentIndex - 1));
    }

    public play(): void {
        this.isPausedState = false;
        this.updateState({ isPaused: false });
    }

    public resume(): void {
        this.play();
    }

    public pause(): void {
        this.isPausedState = true;
        this.updateState({ isPaused: true });
    }

    public stop(): void {
        this.clearAllTimers();
        this.activeRunId++;
        this.updateState({
            messages: [],
            isTyping: false,
            isRecordingAudio: false,
            inputValue: "",
            sendRipple: false,
            attachedImage: null,
            mediaPreview: null,
            audioRecording: null,
            isComplete: false,
            isKeyboardOpen: false,
            pressedKey: null,
            isPaused: false,
            currentStepIndex: 0,
        });
    }

    public restartCurrentScript(): void {
        if (this.state.activeScriptId) {
            this.startScript(this.state.activeScriptId, 0);
        }
    }

    public restart(): void {
        this.restartCurrentScript();
    }

    public setSpeedMultiplier(multiplier: number): void {
        const validMultiplier = Math.max(0.1, multiplier);
        this.options.speedMultiplier = validMultiplier;
        this.updateState({ speedMultiplier: validMultiplier });
    }

    public setSpeed(multiplier: number): void {
        this.setSpeedMultiplier(multiplier);
    }

    public setScript(scriptId: string, startIndex: number = 0): void {
        this.startScript(scriptId, startIndex);
    }
}
