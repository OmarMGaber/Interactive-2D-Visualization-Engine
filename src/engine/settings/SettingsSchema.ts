/**
 * Wraps a settings value inside a stable container object.
 *
 * The envelope allows metadata or additional information
 * to be attached in the future without changing the external API.
 *
 * @template T Type of the stored settings value.
 */
export type SettingsEnvelope<T> = {
    data: T;
};

/**
 * Root container for all persisted settings.
 *
 * Each key represents a settings root/module and maps
 * to a wrapped settings payload.
 *
 * Example:
 * {
 *   "Debug-system": { data: { enabled: true, options: { showFpsCounter: false } } },
 * }
 */
export type SettingsBundle = Record<string, SettingsEnvelope<unknown>>;