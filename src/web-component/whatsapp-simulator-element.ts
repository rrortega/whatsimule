import { WhatsAppSimulatorEngine } from "../core/simulator-engine";
import { ChatScript, WhatsAppSimulatorOptions } from "../core/types";

/**
 * Web Component wrapper `<whatsapp-simulator>` for framework-agnostic usage.
 * Usage in HTML / Vue / Svelte:
 * <whatsapp-simulator id="my-sim"></whatsapp-simulator>
 * <script>
 *   document.getElementById('my-sim').setScripts(myScripts);
 * </script>
 */
export class WhatsAppSimulatorElement extends HTMLElement {
    private engine: WhatsAppSimulatorEngine | null = null;
    private rootElement: HTMLDivElement | null = null;

    static get observedAttributes() {
        return ["assistant-name", "locale", "title", "description", "enable-sound"];
    }

    connectedCallback() {
        this.renderShell();
        this.initEngine();
    }

    disconnectedCallback() {
        if (this.engine) {
            this.engine.clearAllTimers();
        }
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue !== newValue) {
            this.initEngine();
        }
    }

    public setScripts(scripts: Record<string, ChatScript>, defaultActiveScriptId?: string) {
        const options: WhatsAppSimulatorOptions = {
            customScripts: scripts,
            defaultActiveScriptId,
            assistantName: this.getAttribute("assistant-name") || "AI Assistant",
            locale: (this.getAttribute("locale") as "es" | "en") || "es",
            enableSound: this.getAttribute("enable-sound") !== "false",
        };

        this.engine = new WhatsAppSimulatorEngine(options);
        this.engine.subscribe((state) => this.renderState(state));

        const firstId = defaultActiveScriptId || Object.keys(scripts)[0];
        if (firstId) {
            this.engine.startScript(firstId, scripts);
        }
    }

    private initEngine() {
        // Initializes engine with internal container state
    }

    private renderShell() {
        const shadow = this.attachShadow({ mode: "open" });

        const style = document.createElement("style");
        style.textContent = `
            :host {
                display: block;
                font-family: system-ui, -apple-system, sans-serif;
            }
            .rws-wc-frame {
                border-radius: 24px;
                background: #0b141a;
                color: #fff;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                max-width: 420px;
                margin: 0 auto;
            }
            .rws-wc-header {
                background: #202c33;
                padding: 12px 16px;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .rws-wc-body {
                background-color: #0b141a;
                background-image: radial-gradient(#202c33 1px, transparent 1px);
                background-size: 16px 16px;
                height: 480px;
                padding: 16px;
                overflow-y: auto;
            }
            .rws-wc-message {
                margin-bottom: 8px;
                padding: 8px 12px;
                border-radius: 8px;
                max-width: 80%;
                font-size: 14px;
            }
            .rws-wc-user {
                background: #005c4b;
                margin-left: auto;
            }
            .rws-wc-assistant {
                background: #202c33;
                margin-right: auto;
            }
        `;

        this.rootElement = document.createElement("div");
        this.rootElement.className = "rws-wc-frame";
        this.rootElement.innerHTML = `
            <div className="rws-wc-header">
                <strong>${this.getAttribute("assistant-name") || "WhatsApp Simulator"}</strong>
            </div>
            <div className="rws-wc-body" id="messages-container"></div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(this.rootElement);
    }

    private renderState(state: any) {
        if (!this.shadowRoot) return;
        const container = this.shadowRoot.getElementById("messages-container");
        if (!container) return;

        container.innerHTML = state.messages
            .map(
                (m: any) => `
                <div className="rws-wc-message ${m.sender === "resident" || m.sender === "user" ? "rws-wc-user" : "rws-wc-assistant"}">
                    ${m.content}
                </div>
            `
            )
            .join("");

        container.scrollTop = container.scrollHeight;
    }
}

if (typeof window !== "undefined" && !customElements.get("whatsapp-simulator")) {
    customElements.define("whatsapp-simulator", WhatsAppSimulatorElement);
}
