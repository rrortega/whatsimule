import { SoundType } from "./types";

let audioCtx: AudioContext | null = null;

function emitSoundEvent(type: SoundType): void {
    if (typeof window !== "undefined") {
        try {
            window.dispatchEvent(
                new CustomEvent("whatsimule:sound", {
                    detail: { type },
                    bubbles: true,
                    composed: true,
                })
            );
        } catch {
            // ignore event dispatch errors
        }
    }
}

function getAudioContext(): AudioContext | null {
    if (typeof window !== "undefined" && (window as any).__WHATSIMULE_DISABLE_AUDIO__) {
        return null;
    }
    if (!audioCtx && typeof window !== "undefined") {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
            audioCtx = new AudioCtxClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
    }
    return audioCtx;
}

export function playKeyClickSound(): void {
    emitSoundEvent("key");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(850 + Math.random() * 150, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    } catch {
        // ignore audio errors
    }
}

export function playClickSound(): void {
    emitSoundEvent("click");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    } catch {
        // ignore audio errors
    }
}

export function playSentSound(): void {
    emitSoundEvent("sent");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch {
        // ignore audio errors
    }
}

export function playReceiveSound(): void {
    emitSoundEvent("receive");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = "sine";
        osc2.type = "sine";

        osc1.frequency.setValueAtTime(784, ctx.currentTime); // G5
        osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.07); // C6

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.22);

        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.08);

        osc2.start(ctx.currentTime + 0.07);
        osc2.stop(ctx.currentTime + 0.22);
    } catch {
        // ignore audio errors
    }
}

export function playNotificationSound(): void {
    emitSoundEvent("push");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch {
        // ignore audio errors
    }
}

export function playCallRingtoneSound(): void {
    emitSoundEvent("call");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // WhatsApp ringtone style: dual pulse ring (440Hz + 880Hz) repeating thrice
        const pulses = [0, 0.5, 1.0];
        pulses.forEach((startTime) => {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.type = "sine";
            osc2.type = "sine";

            osc1.frequency.setValueAtTime(440, ctx.currentTime + startTime);
            osc2.frequency.setValueAtTime(880, ctx.currentTime + startTime);

            gain.gain.setValueAtTime(0.2, ctx.currentTime + startTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + startTime + 0.38);

            osc1.start(ctx.currentTime + startTime);
            osc2.start(ctx.currentTime + startTime);
            osc1.stop(ctx.currentTime + startTime + 0.38);
            osc2.stop(ctx.currentTime + startTime + 0.38);
        });
    } catch {
        // ignore audio errors
    }
}

export function playHangupSound(): void {
    emitSoundEvent("hangup");
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        // Call disconnect descending tones: 480Hz -> 360Hz -> 240Hz
        const tones = [
            { freq: 480, time: 0 },
            { freq: 360, time: 0.1 },
            { freq: 240, time: 0.2 },
        ];

        tones.forEach(({ freq, time }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
            gain.gain.setValueAtTime(0.2, ctx.currentTime + time);
            gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + time + 0.09);
            osc.start(ctx.currentTime + time);
            osc.stop(ctx.currentTime + time + 0.09);
        });
    } catch {
        // ignore audio errors
    }
}
