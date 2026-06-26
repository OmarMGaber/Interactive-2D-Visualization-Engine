import { Logger } from "@/lib/logger";
import type { SettingsBundle } from "../../SettingsSchema";
import type { PersistSettingsStorage } from "./PersistSettingsStorage";

export class LocalStorageAdapter implements PersistSettingsStorage {
    private constructor() {}

    private logger: Logger = Logger.getOrCreateLogger("LocalStorageAdapter");

    public static SharedInstance = new LocalStorageAdapter();

    load(storageKey: string): SettingsBundle {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return {};
            return JSON.parse(raw) as SettingsBundle;
        } catch {
            this.logger.warn("[SettingsManager] Failed to load settings from localStorage.");
            return {};
        }
    }

    save(storageKey: string, settings: SettingsBundle): void {
        try {
            localStorage.setItem(storageKey, JSON.stringify(settings));
        } catch {
            this.logger.warn("[SettingsManager] Failed to persist settings to localStorage.");
        }
    }

    clear(storageKey: string): void {
        localStorage.removeItem(storageKey);
    }
}