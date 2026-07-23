import { Message, ChatScript, WhatsAppSimulatorOptions, SimulatorEventHandlers } from "./types";
import { playKeyClickSound, playSentSound, playReceiveSound } from "./audio-synth";

export type StateListener = (state: SimulatorState) => void;

export interface SimulatorState {
    activeScriptId: string;
    messages: Message[];
    isTyping: boolean;
    inputValue: string;
    sendRipple: boolean;
    attachedImage: string | null;
    elapsedTime: number;
    totalDuration: number;
}

export class WhatsAppSimulatorEngine {
    private options: WhatsAppSimulatorOptions;
    private handlers: SimulatorEventHandlers;
    private listeners: Set<StateListener> = new Set();

    private activeRunId: number = 0;
    private timeoutIds: any[] = [];
    private intervalId: any = null;

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
            inputValue: "",
            sendRipple: false,
            attachedImage: null,
            elapsedTime: 0,
            totalDuration: 0,
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
        return new Promise((resolve) => {
            const id = setTimeout(resolve, ms);
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
                    let currentText = "";
                    for (let charIndex = 0; charIndex < step.content.length; charIndex++) {
                        if (this.activeRunId !== runId) return;
                        currentText += step.content[charIndex];
                        this.updateState({ inputValue: currentText });

                        if (this.options.enableSound !== false) {
                            playKeyClickSound();
                        }
                        await this.sleep(8 + Math.random() * 10);
                    }

                    await this.sleep(200);
                    if (this.activeRunId !== runId) return;

                    this.updateState({ sendRipple: true });
                    if (this.options.enableSound !== false) {
                        playSentSound();
                    }
                    await this.sleep(150);
                    this.updateState({ sendRipple: false });
                    if (this.activeRunId !== runId) return;

                    const now = new Date();
                    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

                    const newMessage: Message = {
                        id: `${script.id}-${i}`,
                        sender: step.sender,
                        type: step.type,
                        content: step.content,
                        timestamp,
                    };

                    this.updateState({
                        messages: [...this.state.messages, newMessage],
                        inputValue: "",
                    });
                    this.handlers.onMessageSent?.(newMessage);

                    await this.sleep(400);
                } else if (step.type === "image") {
                    this.updateState({ attachedImage: step.content });
                    await this.sleep(900);
                    if (this.activeRunId !== runId) return;

                    this.updateState({ sendRipple: true });
                    if (this.options.enableSound !== false) {
                        playSentSound();
                    }
                    await this.sleep(150);
                    this.updateState({ sendRipple: false });
                    if (this.activeRunId !== runId) return;

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
                        uploadProgress: 0,
                    };

                    this.updateState({
                        messages: [...this.state.messages, imageMessage],
                        attachedImage: null,
                    });
                    this.handlers.onMessageSent?.(imageMessage);

                    const progressSteps = [20, 45, 75, 100];
                    for (let p = 0; p < progressSteps.length; p++) {
                        await this.sleep(250);
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
                }
            } else {
                // Assistant step
                this.updateState({ isTyping: true });
                await this.sleep(1200);
                if (this.activeRunId !== runId) return;

                this.updateState({ isTyping: false });
                if (this.options.enableSound !== false) {
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
                };

                this.updateState({
                    messages: [...this.state.messages, assistantMessage],
                });
                this.handlers.onMessageSent?.(assistantMessage);
            }
        }

        if (this.activeRunId === runId) {
            this.handlers.onScriptComplete?.(script.id);
        }
    }
}
