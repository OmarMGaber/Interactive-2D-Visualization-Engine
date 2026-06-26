import { SettingsNode } from "./SettingsNode";

/** 
 * Interface for objects that provide a settings node for configuration management.
 */
export interface SettingsProvider<T> {
    /** The settings node associated with this provider. */
    readonly settingsNode: SettingsNode<T>;
}

/** Helper function to check if an object is a settings provider. */
export function isSettingsProvider(obj: any): obj is SettingsProvider<any> {
    return obj?.settingsNode instanceof SettingsNode;
}