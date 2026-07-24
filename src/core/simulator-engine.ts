import { Message, ChatScript, WhatsAppSimulatorOptions, SimulatorEventHandlers } from "./types";
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
}

export class WhatsAppSimulatorEngine {
    private options: WhatsAppSimulatorOptions;
    private handlers: SimulatorEventHandlers;
    private listeners: Set<StateListener> = new Set();

    private activeRunId: number = 0;
    private timeoutIds: ReturnType<typeof setTimeout>[] = [];
    private intervalId: ReturnType<typeof setInterval> | null = null;

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

    public startScript(scriptId: string, scripts: Record<string, ChatScript>): void {
        this.clearAllTimers();
        this.activeRunId++;
        const currentRunId = this.activeRunId;

        const script = scripts[scriptId];
        if (!script) return;

        const totalDuration = this.calculateScriptDuration(script);
        this.updateState({
            activeScriptId: scriptId,
            messages: [],
            isTyping: false,
            inputValue: "",
            attachedImage: null,
            elapsedTime: 0,
            totalDuration,
            isComplete: false,
        });

        this.handlers.onScriptChange?.(scriptId);

        // Progress timer
        const stepTime = 50;
        this.intervalId = setInterval(() => {
            if (this.state.elapsedTime >= totalDuration) {
                if (this.intervalId) clearInterval(this.intervalId);
                return;
            }
            this.updateState({ elapsedTime: this.state.elapsedTime + stepTime });
        }, stepTime);

        this.runScriptAsync(script, currentRunId);
    }

    private async sleep(ms: number): Promise<void> {
        const speed = this.options.speedMultiplier && this.options.speedMultiplier > 0 ? this.options.speedMultiplier : 1;
        const adjustedMs = Math.max(10, Math.round(ms / speed));
        return new Promise((resolve) => {
            const id = setTimeout(resolve, adjustedMs);
            this.timeoutIds.push(id);
        });
    }

    private async runScriptAsync(script: ChatScript, runId: number): Promise<void> {
        for (let i = 0; i < script.steps.length; i++) {
            if (this.activeRunId !== runId) return;

            const step = script.steps[i];
            await this.sleep(step.delay);
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
                    for (let charIndex = 0; charIndex < step.content.length; charIndex++) {
                        if (this.activeRunId !== runId) return;
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
                        senderColor: step.senderColor,
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
                        senderColor: step.senderColor,
                        caption: step.caption,
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
                    // Activate WhatsApp Hands-Free Voice Recording Bar
                    const recDuration = 4; // 4 seconds recording simulation
                    for (let sec = 1; sec <= recDuration; sec++) {
                        if (this.activeRunId !== runId) return;
                        const timer = `0:0${sec}`;
                        this.updateState({
                            audioRecording: {
                                isRecording: true,
                                timer,
                                isPaused: false,
                                progress: (sec / recDuration) * 100,
                            }
                        });
                        if (this.options.enableSound !== false && this.options.soundTyping !== false) {
                            playKeyClickSound();
                        }
                        await this.sleep(350);
                    }
                    if (this.activeRunId !== runId) return;

                    // Pause moment
                    this.updateState({
                        audioRecording: {
                            isRecording: true,
                            timer: `0:0${recDuration}`,
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
                        senderColor: step.senderColor,
                        audioDuration: step.audioDuration || "0:14",
                        audioUrl: step.audioUrl,
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
                await this.sleep(1400);
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
                    senderColor: step.senderColor,
                    caption: step.caption,
                    audioDuration: step.audioDuration || "0:14",
                    audioUrl: step.audioUrl,
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
        }
    }
}
