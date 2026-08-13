import { Message, ScriptStep, ChatScript, WhatsAppSimulatorOptions, SimulatorEventHandlers, StepPerspective, SoundType, ContactCardData } from "./types";
import { playKeyClickSound, playSentSound, playReceiveSound, playCallRingtoneSound, playNotificationSound, playClickSound, playHangupSound } from "./audio-synth";

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

export interface IncomingCallState {
    callerName: string;
    callerAvatarUrl?: string;
    callType: "voice" | "video";
    isFingerDeclineActive?: boolean;
}

export interface PushNotificationState {
    title: string;
    text: string;
    app: string;
    avatarUrl?: string;
    isSwipeDismissing?: boolean;
    isFingerTapActive?: boolean;
}

export interface AttachmentMenuState {
    isOpen: boolean;
    activeOption?: "galeria" | "camara" | "ubicacion" | "contacto" | "documento" | "encuesta" | "evento" | "ia_images" | string | null;
    isFingerClickingAttach?: boolean;
    isFingerClickingOption?: boolean;
}

export interface ContactPickerState {
    isOpen: boolean;
    contacts: ContactCardData[];
    searchQuery: string;
    selectedContact: ContactCardData | null;
    isKeyboardOpen?: boolean;
    pressedKey?: string | null;
    isFingerClickingSearch?: boolean;
    isFingerClickingItem?: boolean;
    isFingerClickingSend?: boolean;
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
    attachmentMenu: AttachmentMenuState | null;
    contactPicker: ContactPickerState | null;
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
    isAvatarModalOpen?: boolean;
    avatarRipple?: boolean;
    incomingCall: IncomingCallState | null;
    pushNotification: PushNotificationState | null;
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
            attachmentMenu: null,
            contactPicker: null,
            elapsedTime: 0,
            totalDuration: 0,
            isComplete: false,
            isKeyboardOpen: false,
            pressedKey: null,
            isPaused: false,
            currentStepIndex: 0,
            speedMultiplier: options.speedMultiplier || 1,
            incomingCall: null,
            pushNotification: null,
        };
    }

    public playSound(type: SoundType): void {
        if (this.options.enableSound === false) return;
        if (type === "key" && this.options.soundTyping === false) return;
        if (type === "sent" && this.options.soundSent === false) return;
        if (type === "receive" && this.options.soundReceive === false) return;

        switch (type) {
            case "key":
                playKeyClickSound();
                break;
            case "click":
                playClickSound();
                break;
            case "sent":
                playSentSound();
                break;
            case "receive":
                playReceiveSound();
                break;
            case "push":
                playNotificationSound();
                break;
            case "call":
                playCallRingtoneSound();
                break;
            case "hangup":
                playHangupSound();
                break;
        }

        try {
            this.handlers.onSound?.(type);
            this.options.onSound?.(type);
        } catch {
            // ignore handler errors
        }
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

    public openAvatarModal(): void {
        this.updateState({ isAvatarModalOpen: true });
    }

    public closeAvatarModal(): void {
        this.updateState({ isAvatarModalOpen: false });
    }

    public toggleAvatarModal(): void {
        this.updateState({ isAvatarModalOpen: !this.state.isAvatarModalOpen });
    }

    private updateState(partial: Partial<SimulatorState>): void {
        this.state = { ...this.state, ...partial };
        this.listeners.forEach((listener) => listener(this.state));
    }

    public calculateScriptDuration(script: ChatScript): number {
        if (!script || !script.steps) return 0;
        return script.steps.reduce((acc, step) => {
            let typingDelay = 0;
            const isErase = Boolean(step.eraseBeforeSend || (step as any).erase || (step as any).cancel);
            const isAvatarAction = step.action === "tap_avatar" || step.action === "view_avatar" || (step as any).type === "tap_avatar" || (step as any).type === "avatar";

            if (isAvatarAction) {
                typingDelay = 2500;
            } else if ((step.sender === "resident" || step.sender === "user") && step.type === "text") {
                const isKeyboard = this.options.typingMode === "keyboard";
                const typeCharTime = isKeyboard ? 55 : 13;
                typingDelay = step.content.length * typeCharTime + 750;
                if (isErase) {
                    const backspaceCharTime = isKeyboard ? 48 : 17;
                    typingDelay += 450 + step.content.length * backspaceCharTime + 600;
                }
            } else if ((step.sender === "resident" || step.sender === "user") && step.type === "contact") {
                typingDelay = 4200;
            } else if (step.sender === "assistant" || step.sender === "contact" || step.sender === "asistenxa") {
                typingDelay = isErase ? 1300 : 1400;
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
            contactData: step.contactData || (step.type === "contact" ? { name: step.content || "Contacto", phone: "+52 55 9876 5432" } : undefined),
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
            this.options.customScripts = scripts;
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
            const isErase = Boolean(step.eraseBeforeSend || (step as any).erase || (step as any).cancel);
            if (isErase) continue;
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
            mediaPreview: null,
            audioRecording: null,
            attachmentMenu: null,
            contactPicker: null,
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
        if (this.isPausedState) {
            await new Promise((r) => setTimeout(r, Math.max(10, ms)));
            return;
        }
        const speed = this.options.speedMultiplier && this.options.speedMultiplier > 0 ? this.options.speedMultiplier : 1;
        const targetMs = Math.max(1, Math.round(ms / speed));
        await new Promise<void>((r) => {
            const id = setTimeout(() => {
                const idx = this.timeoutIds.indexOf(id);
                if (idx !== -1) this.timeoutIds.splice(idx, 1);
                r();
            }, targetMs);
            this.timeoutIds.push(id);
        });
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

            const isAvatarAction = step.action === "tap_avatar" || step.action === "view_avatar" || (step as any).type === "tap_avatar" || (step as any).type === "avatar";
            const isCloseAvatarAction = step.action === "close_avatar";

            if (isAvatarAction) {
                this.updateState({ avatarRipple: true });
                this.playSound("key");
                await this.sleep(220);
                if (this.activeRunId !== runId) return;

                this.updateState({ avatarRipple: false, isAvatarModalOpen: true });
                const viewDuration = step.delay && step.delay > 500 ? step.delay : 2000;
                await this.sleep(viewDuration);
                if (this.activeRunId !== runId) return;

                this.updateState({ isAvatarModalOpen: false });
                await this.sleep(350);
                continue;
            }

            if (isCloseAvatarAction) {
                this.updateState({ isAvatarModalOpen: false });
                await this.sleep(300);
                continue;
            }

            const isIncomingCallAction = step.action === "incoming_call" || (step as any).type === "incoming_call" || (step as any).type === "call";
            const isPushNotificationAction = step.action === "push_notification" || (step as any).type === "push_notification" || (step as any).type === "notification";

            if (isIncomingCallAction) {
                const callData = step.callData || {};
                const callerName = callData.callerName || this.options.assistantName || "Contacto";
                const callerAvatarUrl = callData.callerAvatarUrl || this.options.assistantAvatarUrl;
                const callType = callData.callType || "voice";

                this.playSound("call");

                // Show Incoming Call Banner / Screen
                this.updateState({
                    incomingCall: {
                        callerName,
                        callerAvatarUrl,
                        callType,
                        isFingerDeclineActive: false,
                    }
                });

                await this.sleep(1200);
                if (this.activeRunId !== runId) return;

                // Animate Finger Touch Cursor over Decline Red Button
                this.updateState({
                    incomingCall: {
                        callerName,
                        callerAvatarUrl,
                        callType,
                        isFingerDeclineActive: true,
                    }
                });

                this.playSound("click");

                await this.sleep(1600);
                if (this.activeRunId !== runId) return;

                // Call Declined & Screen Closed
                this.playSound("hangup");
                this.updateState({ incomingCall: null });
                await this.sleep(450);
                continue;
            }

            if (isPushNotificationAction) {
                const notifData = step.notificationData || {};
                const title = notifData.title || this.options.assistantName || "WhatsApp";
                const text = notifData.text || step.content || "Nuevo mensaje recibido";
                const app = notifData.app || "WhatsApp";
                const avatarUrl = notifData.avatarUrl || this.options.assistantAvatarUrl;
                const actionType = notifData.action || "dismiss";

                this.playSound("push");

                // Slide down push notification banner from top
                this.updateState({
                    pushNotification: {
                        title,
                        text,
                        app,
                        avatarUrl,
                        isSwipeDismissing: false,
                        isFingerTapActive: false,
                    }
                });

                await this.sleep(1400);
                if (this.activeRunId !== runId) return;

                if (actionType === "tap") {
                    this.updateState({
                        pushNotification: {
                            title,
                            text,
                            app,
                            avatarUrl,
                            isSwipeDismissing: false,
                            isFingerTapActive: true,
                        }
                    });
                    this.playSound("click");
                    await this.sleep(400);
                } else {
                    this.updateState({
                        pushNotification: {
                            title,
                            text,
                            app,
                            avatarUrl,
                            isSwipeDismissing: true,
                            isFingerTapActive: false,
                        }
                    });
                    this.playSound("click");
                    await this.sleep(450);
                }
                if (this.activeRunId !== runId) return;

                this.updateState({ pushNotification: null });
                await this.sleep(350);
                continue;
            }

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

                        this.playSound("key");
                        const charDelay = isKeyboard ? 40 + Math.random() * 30 : 8 + Math.random() * 10;
                        await this.sleep(charDelay);
                    }

                    const isEraseStep = Boolean(step.eraseBeforeSend || (step as any).erase || (step as any).cancel);

                    if (isEraseStep) {
                        if (isKeyboard) {
                            this.updateState({ pressedKey: null });
                        }
                        // Hesitation pause to simulate user regret
                        await this.sleep(450);
                        if (this.activeRunId !== runId) return;

                        // Erase character by character back to 0 characters
                        while (currentText.length > 0) {
                            if (this.activeRunId !== runId) return;
                            currentText = currentText.slice(0, -1);
                            this.updateState({
                                inputValue: currentText,
                                pressedKey: isKeyboard ? "BACKSPACE" : null,
                            });

                            this.playSound("key");
                            const backspaceDelay = isKeyboard ? 35 + Math.random() * 25 : 12 + Math.random() * 10;
                            await this.sleep(backspaceDelay);
                        }

                        if (isKeyboard) {
                            this.updateState({ pressedKey: null });
                            await this.sleep(250);
                        }
                        this.updateState({ isKeyboardOpen: false, pressedKey: null, inputValue: "" });
                        await this.sleep(350);
                        continue; // Skip posting message bubble
                    }

                    if (isKeyboard) {
                        this.updateState({ pressedKey: null });
                        await this.sleep(250);
                    } else {
                        await this.sleep(200);
                    }
                    if (this.activeRunId !== runId) return;

                    this.updateState({ sendRipple: true });
                    this.playSound("sent");
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
                                this.playSound("key");
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
                    this.playSound("sent");
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

                        if (s % 4 === 0) {
                            this.playSound("key");
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
                    this.playSound("sent");
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
                } else if (step.type === "contact") {
                    // Contact send flow: Attach menu -> Contact icon -> Contact Picker -> Search & Filter -> Click Contact -> Send
                    const contact: ContactCardData = step.contactData || {
                        name: step.content || "Carlos Rodríguez",
                        phone: "+52 55 9876 5432",
                        organization: "ChambaPro AI",
                    };

                    const sampleContacts: ContactCardData[] = [
                        { name: contact.name, phone: contact.phone || "+52 55 9876 5432", avatarUrl: contact.avatarUrl || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80", organization: contact.organization },
                        { name: "Ana Martínez", phone: "+52 55 1122 3344", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80", organization: "Diseño UI/UX" },
                        { name: "Dr. Fernando Ruiz", phone: "+52 55 5566 7788", avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80", organization: "Medicina General" },
                        { name: "Laura Gómez", phone: "+52 55 4433 2211", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80", organization: "Logística" },
                        { name: "Sofía Mendoza", phone: "+52 55 8899 0011", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80", organization: "Soporte Técnico" },
                    ].sort((a, b) => a.name.localeCompare(b.name));

                    // 1. Click paperclip attachment button
                    this.updateState({
                        attachmentMenu: {
                            isOpen: false,
                            activeOption: null,
                            isFingerClickingAttach: true,
                        }
                    });
                    this.playSound("click");
                    await this.sleep(350);
                    if (this.activeRunId !== runId) return;

                    // 2. Open attachment menu with options grid
                    this.updateState({
                        attachmentMenu: {
                            isOpen: true,
                            activeOption: null,
                            isFingerClickingAttach: false,
                        }
                    });
                    await this.sleep(650);
                    if (this.activeRunId !== runId) return;

                    // 3. Click "Contacto" option icon
                    this.updateState({
                        attachmentMenu: {
                            isOpen: true,
                            activeOption: "contacto",
                            isFingerClickingOption: true,
                        }
                    });
                    this.playSound("click");
                    await this.sleep(400);
                    if (this.activeRunId !== runId) return;

                    // 4. Close attachment menu & Open Contact selection sheet
                    this.updateState({
                        attachmentMenu: null,
                        contactPicker: {
                            isOpen: true,
                            contacts: sampleContacts,
                            searchQuery: "",
                            selectedContact: null,
                            isKeyboardOpen: false,
                            isFingerClickingSearch: false,
                        }
                    });
                    await this.sleep(550);
                    if (this.activeRunId !== runId) return;

                    // 5. Click Search bar
                    this.updateState({
                        contactPicker: {
                            isOpen: true,
                            contacts: sampleContacts,
                            searchQuery: "",
                            selectedContact: null,
                            isKeyboardOpen: false,
                            isFingerClickingSearch: true,
                        }
                    });
                    this.playSound("click");
                    await this.sleep(300);
                    if (this.activeRunId !== runId) return;

                    // 6. Keyboard opens & type contact first name character by character
                    const firstName = contact.name.trim().split(" ")[0] || "Carlos";
                    let currentQuery = "";

                    for (let cIdx = 0; cIdx < firstName.length; cIdx++) {
                        if (this.activeRunId !== runId) return;
                        const char = firstName[cIdx];
                        currentQuery += char;

                        this.updateState({
                            contactPicker: {
                                isOpen: true,
                                contacts: sampleContacts,
                                searchQuery: currentQuery,
                                selectedContact: null,
                                isKeyboardOpen: true,
                                pressedKey: char.toUpperCase(),
                                isFingerClickingSearch: false,
                            }
                        });
                        this.playSound("key");
                        const charDelay = 45 + Math.random() * 25;
                        await this.sleep(charDelay);
                    }

                    this.updateState({
                        contactPicker: {
                            isOpen: true,
                            contacts: sampleContacts,
                            searchQuery: currentQuery,
                            selectedContact: null,
                            isKeyboardOpen: true,
                            pressedKey: null,
                        }
                    });
                    await this.sleep(400);
                    if (this.activeRunId !== runId) return;

                    // 7. Click target contact item in filtered list
                    this.updateState({
                        contactPicker: {
                            isOpen: true,
                            contacts: sampleContacts,
                            searchQuery: currentQuery,
                            selectedContact: contact,
                            isKeyboardOpen: false,
                            pressedKey: null,
                            isFingerClickingItem: true,
                        }
                    });
                    this.playSound("click");
                    await this.sleep(500);
                    if (this.activeRunId !== runId) return;

                    // 8. Click Send button
                    this.updateState({
                        contactPicker: {
                            isOpen: true,
                            contacts: sampleContacts,
                            searchQuery: currentQuery,
                            selectedContact: contact,
                            isKeyboardOpen: false,
                            pressedKey: null,
                            isFingerClickingSend: true,
                        }
                    });
                    this.playSound("sent");
                    this.updateState({ sendRipple: true });
                    await this.sleep(250);
                    if (this.activeRunId !== runId) return;

                    // 9. Close contact picker & Post Contact Card Message
                    this.updateState({
                        contactPicker: null,
                        sendRipple: false,
                    });

                    const now = new Date();
                    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

                    const contactMessage: Message = {
                        id: `${script.id}-${i}`,
                        sender: step.sender,
                        type: "contact",
                        content: step.content || contact.name,
                        contactData: contact,
                        timestamp,
                        senderName: step.senderName,
                        senderAvatarUrl: step.senderAvatarUrl,
                        senderColor: step.senderColor,
                        perspective: step.perspective,
                    };

                    this.updateState({
                        messages: [...this.state.messages, contactMessage],
                    });
                    this.handlers.onMessageSent?.(contactMessage);
                    await this.sleep(400);
                }
            } else {
                // Assistant step
                const isEraseStep = Boolean(step.eraseBeforeSend || (step as any).erase || (step as any).cancel);
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

                if (isEraseStep) {
                    this.updateState({ isTyping: false, isRecordingAudio: false });
                    await this.sleep(300);
                    continue; // Skip posting message bubble
                }

                this.updateState({ isTyping: false, isRecordingAudio: false });
                this.playSound("receive");

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
                    linkPreview: step.linkPreview,
                    perspective: step.perspective,
                    contactData: step.contactData || (step.type === "contact" ? { name: step.content || "Carlos Rodríguez", phone: "+52 55 9876 5432" } : undefined),
                };

                this.updateState({
                    messages: [...this.state.messages, assistantMessage],
                });
                this.handlers.onMessageSent?.(assistantMessage);
                await this.sleep(300);
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

    public setCustomScripts(scripts: Record<string, ChatScript>): void {
        this.options.customScripts = scripts;
    }

    public restartCurrentScript(): void {
        const customScripts = this.options.customScripts || {};
        const scriptId =
            this.state.activeScriptId ||
            this.options.defaultActiveScriptId ||
            Object.keys(customScripts)[0] ||
            "embed_script";

        if (scriptId) {
            this.startScript(scriptId, customScripts, 0);
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
