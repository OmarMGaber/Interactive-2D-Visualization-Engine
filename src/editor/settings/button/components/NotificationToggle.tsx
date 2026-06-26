import { useUiSettingsStore } from "@/store/useUiSettingsStore";
import ToggleSettingItem from "./ToggleSettingItem";

export default function NotificationToggle() {
    const enableNotifications = useUiSettingsStore((s) => s.enableToast);
    const setEnableNotifications = useUiSettingsStore((s) => s.setEnableToast);

    return (
        <ToggleSettingItem
            label="Enable Notifications"
            description="Toggle to enable or disable notifications for important events and updates."
            enabled={enableNotifications}
            onToggle={(checked) => setEnableNotifications(checked)}
        />
    );
}