import { Application, UPDATE_PRIORITY } from "pixi.js";
import gsap from "gsap";

import { InputSystem } from "./systems/InputSystem";
import { TypedEventEmitter } from "./events/TypedEventEmitter";
import { DragSystem } from "./systems/DragSystem";
import { ObjectOutlineSystem } from "./systems/outline/ObjectOutlineSystem";
import { DebugSystem } from "./systems/debug/DebugSystem";
import { ZoomSystem } from "./systems/ZoomSystem";
import enableInteractiveMode from "./utils/EnableInteractiveMode";
import { SystemManager } from "./managers/SystemManager";
import { type RuntimeEvents } from "./events/RuntimeEvents";
import { EventEmitter } from "./events/EventEmitter";
import type { RuntimeCommands } from "./events/RuntimeCommands";
import { InteractionManager } from "./managers/InteractionManager";
import { InteractionSystem } from "./systems/interaction/InteractionSystem";
import { basicDebugTextHandler } from "./systems/debug/DebugTextHandler";
import { VisualRegistry } from "./managers/VisualRegistry";
import { type SupportedVisualTypes } from "./managers/VisualFactory";
import { basicOutlineDrawer } from "./systems/outline/OutlineDrawer";
import type { System, SystemInfo } from "./systems/System";
import { SettingsManager } from "./managers/SettingsManager";
import { LocalStorageAdapter } from "./settings/strategy/persist/LocalStorageAdapter";
import type { VisualObject } from "./visuals/VisualObject";
import { BundledStorageStrategy } from "./settings/strategy/storage/BundledStorageStrategy";
import type { SettingsProvider } from "./settings/SettingsProvider";
import { SettingsNode } from "./settings/SettingsNode";
import { Signal } from "./common/Signal";
import { RegistrySystem } from "./systems/RegistrySystem";

import { RuntimeLifecycle } from "./RuntimeLifecycle";
import { ViewportScaler } from "./ViewportScaler";
import { GsapPixiSync } from "./GsapPixiSync";
import type { RuntimeContext } from "./RuntimeContext";
import type { RuntimeAPI } from "./RuntimeAPI";
import { Logger } from "@/lib/logger";

export interface RuntimeSettings {
    backgroundColor: string;
    tickerSpeed: number;
}

export const DEFAULT_SETTINGS: RuntimeSettings = {
    backgroundColor: "#f5f5dc",
    tickerSpeed: 1,
};

/**
 * Main runtime class for the visualization engine (entry point).
 * Responsible for orchestrating everything.
 */
export class VisualizationRuntime implements SettingsProvider<RuntimeSettings> {
    public readonly settingsNode: SettingsNode<RuntimeSettings>;

    /**
     * Maximum render resolution. Caps high-DPI scaling to prevent accidental
     * performance degradation on very dense screens.
     */
    private static readonly MAX_RENDER_RESOLUTION = 2;

    /**
     * Persistent storage key for runtime settings.
     */
    private static readonly SETTINGS_KEY = "ive-runtime-v1";

    /**
     * Emits runtime events (visual created/destroyed, paused/resumed, ...).
     * External modules subscribe here to react to state changes.
     */
    private readonly eventsBus: TypedEventEmitter<RuntimeEvents>;

    /**
     * Receives runtime commands (create visual, pause, change background, ...).
     * External modules dispatch here to request changes.
     */
    private readonly commandsBus: TypedEventEmitter<RuntimeCommands>;

    /** Current lifecycle state of the runtime. */
    private _lifecycle: RuntimeLifecycle = RuntimeLifecycle.Idle;

    /** Settings states signals, updated by setters, observed by {@link wireSignals()}. */
    private readonly _backgroundColor = new Signal<string>(DEFAULT_SETTINGS.backgroundColor);
    private readonly _tickerSpeed = new Signal<number>(DEFAULT_SETTINGS.tickerSpeed);

    /** The main PixiJS application instance. */
    private readonly app: Application;

    /** Input system for handling user interactions. */
    private readonly inputSystem: InputSystem;

    /** Interaction manager for storing interaction state. */
    private readonly interactionManager: InteractionManager;

    /** Registry that manages all visual objects. */
    private readonly visualRegistry: VisualRegistry;

    /** Registry that manages all systems. */
    private readonly systemManager: SystemManager;

    /** Manager for handling settings persistence and management. */
    private readonly settingsManager: SettingsManager;

    /** Synchronization manager for handling GSAP animations with PixiJS. */
    private readonly gsapSync: GsapPixiSync;

    /** Viewport scaler for handling window resizing. */
    private viewportScaler!: ViewportScaler;

    private logger = Logger.getOrCreateLogger("VisualizationRuntime");

    // Caches
    private runtimeAPICache: RuntimeAPI | null = null;

    constructor() {
        this.app = new Application();
        this.inputSystem = new InputSystem(this.app.stage, EventEmitter.Shared);
        this.interactionManager = new InteractionManager();

        enableInteractiveMode(this.app.stage);

        this.eventsBus = new TypedEventEmitter<RuntimeEvents>();
        this.commandsBus = new TypedEventEmitter<RuntimeCommands>();

        const context = this.buildContext();

        this.settingsManager = new SettingsManager(
            new BundledStorageStrategy(
                `${VisualizationRuntime.SETTINGS_KEY}-settings`,
                LocalStorageAdapter.SharedInstance,
            ),
        );

        this.systemManager = new SystemManager(context);
        this.visualRegistry = new VisualRegistry(this.app.stage, this.eventsBus);
        this.gsapSync = new GsapPixiSync(this.app);

        { /** Registers all built-in systems. */
            this.systemManager.register(InteractionSystem);
            this.systemManager.register(DragSystem);
            this.systemManager.register(ZoomSystem);
            this.systemManager.register(DebugSystem, basicDebugTextHandler);
            this.systemManager.register(ObjectOutlineSystem, basicOutlineDrawer);
        }

        this.settingsNode = new SettingsNode<RuntimeSettings>(
            VisualizationRuntime.SETTINGS_KEY,
            () => this.exportSettings(),
            (data) => this.applySettings(data),
            [],
            () => ({ ...DEFAULT_SETTINGS }),
        );
    }

    /**
     * Initializes PixiJS and starts the runtime.
     *
     * @remarks
     * Call exactly once, after the container element exists in the DOM
     * (e.g. inside React's `useEffect(..., [])` or after `DOMContentLoaded`).
     *
     * @param container Host element for the Pixi canvas.
     * @throws {Error} If the function is called more than once or if the runtime is already running.
     */
    public async start(container: HTMLElement): Promise<void> {
        this.assertLifecycle(RuntimeLifecycle.Idle, "start");

        this._lifecycle = RuntimeLifecycle.Starting;

        await this.initPixi(container);

        this.viewportScaler = new ViewportScaler(
            this.app,
            window.screen.width,
            window.screen.height,
        );

        this.viewportScaler.observe(container);

        this.gsapSync.attach();
        this.registerTickerUpdates();
        this.wireSignals();
        this.wireCommands();
        this.wireEvents();
        this.wireVisualRegistryCallbacks();

        this.systemManager.get(DebugSystem)!.attachHost(container);

        this._lifecycle = RuntimeLifecycle.Running;

        this.wireSettings();
    }

    /**
     * Creates a visual, adds it to the stage, and returns it.
     *
     * @throws {Error} If the runtime is not running.
     */
    public createVisual<K extends keyof SupportedVisualTypes>(
        type: K,
        ...args: ConstructorParameters<SupportedVisualTypes[K]>
    ): InstanceType<SupportedVisualTypes[K]> {
        this.assertLifecycle(RuntimeLifecycle.Running, "createVisual");
        return this.visualRegistry.create(type, ...args);
    }

    /**
     * Destroys the visual with the given ID. No-op if the ID is unknown.
     *
     * @throws {Error} If the runtime is not running.
     */
    public destroyVisual(visualId: number): void {
        this.assertLifecycle(RuntimeLifecycle.Running, "destroyVisual");
        this.visualRegistry.destroyById(visualId);
    }

    /**
     * Pauses the ticker and GSAP timeline.
     * No-op if already paused.
     * Else
     *  - Sets the lifecycle to `RuntimeLifecycle.Paused`.
     *  - Stops the Pixi ticker and GSAP timeline.
     *  - Emits `"runtime:paused"` through the {@link eventsBus}.
     * 
     * @throws {Error} If the runtime is not running.
     */
    public pause(): void {
        if (this._lifecycle == RuntimeLifecycle.Paused) return;
        this.assertLifecycle(RuntimeLifecycle.Running, "pause")

        this._lifecycle = RuntimeLifecycle.Paused;
        this.app.ticker.stop();
        gsap.globalTimeline.pause();
        this.eventsBus.emit("runtime:paused");
    }

    /**
     * Resumes the ticker and GSAP timeline.
     * No-op if already running.
     * Else
     *  - Sets the lifecycle to `RuntimeLifecycle.Running`.
     *  - Starts the Pixi ticker and GSAP timeline.
     *  - Emits `"runtime:resumed"` through the {@link eventsBus}.
     *
     * @throws {Error} If the runtime is not paused.
     */
    public resume(): void {
        if (this._lifecycle == RuntimeLifecycle.Running) return;
        this.assertLifecycle(RuntimeLifecycle.Paused, "resume");

        this._lifecycle = RuntimeLifecycle.Running;
        this.app.ticker.start();
        gsap.globalTimeline.resume();
        this.eventsBus.emit("runtime:resumed");
    }

    /** Tears down all resources. Subsequent calls are safe no-ops. */
    public destroy(): void {
        this.logger.info("Destroying runtime...");
        if (this._lifecycle === RuntimeLifecycle.Destroyed) return;

        this.app.ticker.stop();
        this.gsapSync.detach();
        this.viewportScaler.disconnect();

        this.visualRegistry.clear();
        this.systemManager.destroy();
        this.settingsManager.destroy();

        this.app.destroy(true, { children: true });

        this._lifecycle = RuntimeLifecycle.Destroyed;
    }

    // Getters and setters.

    /**
     * Background color of the canvas.
     * Accepts any valid CSS color string (e.g. `"red"`, `"#ff0000"`).
     */
    public get backgroundColor(): string {
        return this._backgroundColor.value;
    }
    public set backgroundColor(color: string) {
        color = color.trim().toLowerCase();
        this._backgroundColor.value = color;
    }

    /**
     * Global animation speed multiplier.
     * `1` = normal, `0.5` = half speed, `2` = double speed, etc...
     */
    public get tickerSpeed(): number {
        return this._tickerSpeed.value;
    }
    public set tickerSpeed(speed: number) {
        if (speed <= 0) {
            throw new RangeError("Ticker speed must be positive");
        }
        if (this._tickerSpeed.value === speed) return;
        this._tickerSpeed.value = speed;
    }

    /** Current runtime lifecycle state. */
    public get lifecycle(): RuntimeLifecycle {
        return this._lifecycle;
    }

    /**
     * Current stage-to-screen scale factor, updated on every container resize.
     */
    public get scale(): number {
        return this.viewportScaler.currentScale;
    }

    public get settings(): RuntimeSettings {
        return {
            backgroundColor: this.backgroundColor,
            tickerSpeed: this.tickerSpeed,
        };
    }

    /**
     * Gets information about all registered systems.
     * 
     * @returns Array of system information, sorted by system ID.
     */
    public getSystemsInfo(): SystemInfo[] {
        const systems: SystemInfo[] = [];

        for (const sys of this.systemManager.values()) {
            systems.push(sys.getInfoSnapshot());
        }

        return systems.sort((a, b) => a.id - b.id);
    }

    /**
     * Gets the public API for interacting with the runtime events and commands buses.
     * 
     * @returns 
     */
    public get runttimeAPI(): RuntimeAPI {
        this.assertLifecycle(RuntimeLifecycle.Running, "getRuntimeAPI");

        if (this.runtimeAPICache == null) {
            this.runtimeAPICache = {
                commandsChannel: {
                    emit: this.commandsBus.emit.bind(this.commandsBus),
                },
                eventsChannel: {
                    on: this.eventsBus.on.bind(this.eventsBus),
                },
                getSettings: () => this.settings,
                isRunning: () => this.lifecycle === RuntimeLifecycle.Running,
                getSystemsInfo: this.getSystemsInfo.bind(this),
            };
        }
        
        return this.runtimeAPICache;
    }

    // ******************************** Private Methods ******************************** //

    /** Sets the position of a visual mapped from screen coordinates to stage coordinates using the current viewport scale. */
    private setVisualPosition(visual: VisualObject, x: number, y: number): void {
        visual.position.set(x / this.scale, y / this.scale);
    }

    /** Builds the context object shared with all systems. */
    private buildContext(): RuntimeContext {
        if (!this.interactionManager || !this.inputSystem || !this.eventsBus || !this.commandsBus) {
            throw new Error("Failed to build runtime context: missing dependencies");
        }

        return {
            interactionManagerState: this.interactionManager,
            input: this.inputSystem,
            eventsChannel: this.eventsBus,
            commandsChannel: this.commandsBus,
        };
    }

    /** Initializes PixiJS and appends its canvas to the container. */
    private async initPixi(container: HTMLElement): Promise<void> {
        const resolution = Math.min(
            window.devicePixelRatio || 1,
            VisualizationRuntime.MAX_RENDER_RESOLUTION,
        );

        await this.app.init({
            resizeTo: container,
            antialias: true,
            resolution,
            autoDensity: true,
            backgroundColor: this._backgroundColor.value,
        });

        container.appendChild(this.app.canvas);
    }

    /** Attaches all system `update` methods and the visual update loop to the Pixi ticker. */
    private registerTickerUpdates(): void {
        for (const sys of this.systemManager.values()) {
            const s = sys as System;
            if (s.update) {
                this.app.ticker.add(s.update, sys, UPDATE_PRIORITY.HIGH);
            }
        }

        this.app.ticker.add(this.tickVisuals, this);
    }

    /** Pixi ticker callback: calls `update()` on every registered visual. */
    private tickVisuals(): void {
        const visuals = this.visualRegistry.getAll();
        const len = visuals.length;

        for (let i = 0; i < len; i++) {
            visuals[i].update();
        }
    }

    // ******************************** Wiring helpers ******************************** //

    /**
     * Subscribes to Signals and propagates changes to the Pixi renderer and
     * the events bus. Called once at the end of `start()`, after PixiJS is ready.
     *
     * Keeping this separate from `applySettings` avoids side-effects during
     * deserialization (where we only want to update in-memory state, not emit events).
     */
    private wireSignals(): void {
        this._backgroundColor.subscribe((color) => {
            this.app.renderer.background.color = color;
            this.eventsBus.emit("settings:backgroundColorChanged", { color });
        });

        this._tickerSpeed.subscribe((speed) => {
            this.app.ticker.speed = speed;
            this.eventsBus.emit("settings:tickerSpeedChanged", { speed });
        });
    }

    /**
     * Subscribes to commandsBus messages.
     *
     * Each handler is a dedicated private method so individual behaviors are
     * testable, readable, and easy to extend without growing a single blob.
     */
    private wireCommands(): void {
        function handleCreateArrayVisual(this: VisualizationRuntime, { x, y, items }: { x: number; y: number; items: unknown[] }): void {
            try {
                const visual = this.visualRegistry.create("array", items);
                this.setVisualPosition(visual, x, y);
            } catch (error) {
                this.eventsBus.emit("runtime:error", { message: "Failed to create array visual." });
                this.logger.error("Error creating array visual:", { x, y, items, error });
            }
        }

        this.commandsBus.on("interaction:hover", ({ object }) =>
            this.interactionManager.setHovered(object));

        this.commandsBus.on("interaction:select", ({ object }) =>
            this.interactionManager.setSelected(object));

        this.commandsBus.on("settings:setTickerSpeed", ({ speed }) =>
            (this.tickerSpeed = speed));

        this.commandsBus.on("settings:setBackgroundColor", ({ color }) =>
            (this.backgroundColor = color));

        this.commandsBus.on("runtime:pause", () => this.pause());
        this.commandsBus.on("runtime:resume", () => this.resume());

        this.commandsBus.on("create:visual:array", (args) => handleCreateArrayVisual.call(this, args));
        this.commandsBus.on("visuals:destroy", ({ visualId }) => this.destroyVisual(visualId));

        this.commandsBus.on("systems:addVisual", ({ visualId, systemId }) => {
            const visual = this.visualRegistry.getById(visualId);
            if (!visual) {
                this.logger.warn(`Visual with ID ${visualId} not found`);
                return;
            }

            const system = this.systemManager.getSystemById(systemId);
            if (!(system instanceof RegistrySystem)) {
                this.logger.warn(`System with ID ${systemId} is not registry-enabled`);
                return;
            }

            system.registerObject(visual);
        });

        this.commandsBus.on("systems:removeVisual", ({ visualId, systemId }) => {
            const visual = this.visualRegistry.getById(visualId);
            if (!visual) {
                this.logger.warn(`Visual with ID ${visualId} not found`);
                return;
            }

            const system = this.systemManager.getSystemById(systemId);
            if (!(system instanceof RegistrySystem)) {
                this.logger.warn(`System with ID ${systemId} is not registry-enabled`);
                return;
            }

            system.unregisterObject(visual);
        });

        this.commandsBus.on("systems:setEnabled", ({ systemId, enabled }) => {
            const system = this.systemManager.getSystemById(systemId);

            if (!system) {
                this.logger.warn(`System with ID ${systemId} not found`);
                return;
            }
            system.state.value = enabled;
        });

        this.commandsBus.on("settings:reset", () => this.settingsManager.resetToDefaults());

        this.commandsBus.on("systems:setOptionEnabled", ({ systemId, optionId, enabled }) => {
            const system = this.systemManager.getSystemById(systemId);

            if (!system) {
                this.logger.warn(`System with ID ${systemId} not found`);
                return;
            }

            const option = system.options.find((opt) => opt.id === optionId);
            if (!option) {
                this.logger.warn(`Option with ID ${optionId} not found in system ${systemId}`);
                return;
            }

            option.state.value = enabled;
        });
    }

    /**
     * Subscribes to relevant runtime events and propagates them to external listeners via the events bus.
     * Called once at the end of `start()`.
     */
    private wireEvents(): void {
        this.interactionManager.onSelect((selected: VisualObject | null) => {
            this.eventsBus.emit("systems:selectionChanged", {
                visualId: selected?.uid ?? null,
                visualType: selected ? selected.constructor.name : null,
            });
        });

        for (const system of this.systemManager.values()) {
            system.state.subscribe((enabled) => {
                this.eventsBus.emit(enabled ? "systems:enabled" : "systems:disabled", {
                    systemId: system.id,
                });
            });

            for (const option of system.options) {
                option.state.subscribe((enabled) => {
                    this.eventsBus.emit(enabled ? "systems:optionEnabled" : "systems:optionDisabled", {
                        systemId: system.id,
                        optionId: option.id,
                    });
                });
            }
        }
    }

    /**
     * Registers VisualRegistry callbacks to keep the SystemManager and
     * InteractionManager consistent with the current set of live visuals.
     */
    private wireVisualRegistryCallbacks(): void {
        this.visualRegistry.addOnRegisterCallback((visual) => {
            this.systemManager.registerVisualToAllSystems(visual);
        });

        /**
         * If a visual that is currently selected or hovered is destroyed, clears that
         * slot to prevent the InteractionManager from holding a stale reference.
         */
        function clearInteractionIfDestroyed(this: VisualizationRuntime, visual: VisualObject): void {
            if (this.interactionManager.getSelected()?.uid === visual.uid) {
                this.logger.debug("Clearing selection for destroyed visual", { visualId: visual.uid });
                this.interactionManager.setSelected(null);
            }
            if (this.interactionManager.getHovered()?.uid === visual.uid) {
                this.logger.debug("Clearing hover for destroyed visual", { visualId: visual.uid });
                this.interactionManager.setHovered(null);
            }
        };


        this.visualRegistry.addOnDestroyCallback((visual) => {
            this.systemManager.unregisterVisualFromAllSystems(visual);
            clearInteractionIfDestroyed.call(this, visual);
        });
    }


    /**
     * Subscribes to settings changes and propagates them to the SettingsManager for persistence.
     * Called once at the end of `start()`.
     * - Hooks the {@link settingsNode} notify() to react to any settings change and trigger persistence.
     * - Registers the runtime and presistable managers as roots in the SettingsManager to include them in the persistence graph.
     */
    private wireSettings(): void {
        this._backgroundColor.subscribe(() => this.settingsNode.notify());
        this._tickerSpeed.subscribe(() => this.settingsNode.notify());

        this.settingsManager.addRoot(this);
        this.settingsManager.addRoot(this.systemManager);
    }

    // ******************************** SettingsProvider implementation ******************************** //

    private exportSettings(): RuntimeSettings {
        return {
            backgroundColor: this.backgroundColor,
            tickerSpeed: this.tickerSpeed,
        };
    }

    /**
     * Restores persisted settings directly onto the backing Signals, bypassing
     * public setters intentionally, we don't want lifecycle guards or event emissions during deserialization.
     */
    private applySettings(data: Partial<RuntimeSettings>): void {
        if (data.backgroundColor) this._backgroundColor.value = data.backgroundColor;
        if (data.tickerSpeed) this._tickerSpeed.value = data.tickerSpeed;
    }

    /**
     * Lifecycle guard.
     * Asserts that the runtime is in the expected lifecycle state.
     * Throws a descriptive error if it isn't, making misuse obvious at the call site.
     *
     * @param expected The required state for the calling operation.
     * @param operation Optional name of the calling operation for clearer error messages (defaults to the caller's name).
     */
    private assertLifecycle(expected: RuntimeLifecycle, operation: string): void {
        if (this._lifecycle !== expected) {
            throw new Error(
                `Cannot call '${operation}' while the runtime is in state '${this._lifecycle}'. ` +
                `Expected state: '${expected}'.`
            );
        }
    }
}