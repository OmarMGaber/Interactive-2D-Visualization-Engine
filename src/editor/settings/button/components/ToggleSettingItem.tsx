"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, Lock } from "lucide-react";

type ToggleSettingsItemProps = {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (checked: boolean) => void;
    shadow?: boolean;

    locked?: boolean;
    lockMessage?: string;
    children?: ToggleSettingsItemProps[];
};

export default function ToggleSettingItem({
    label,
    description,
    enabled,
    shadow = true,  
    locked,
    lockMessage,
    onToggle,
    children = [],
}: ToggleSettingsItemProps) {
    const [open, setOpen] = useState(false);

    return (
        <Card className={`bg-background/80 border ${shadow ? "shadow-lg" : "shadow-none"} ${
            children.length > 0 ? "rounded-tl-md rounded-tr-md pb-0" : "rounded-md"
        } ${open ? 'ring-1 ring-accent/30' : ''}`}>
            <CardContent className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                        {label} {locked && "(Locked)"}
                    </p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>

                <Switch checked={enabled} disabled={locked} onCheckedChange={onToggle} />
            </CardContent>

            {locked && lockMessage && (
                <div className="mx-4 flex items-start gap-2 rounded-md border border-amber-200/70 bg-amber-50/80 px-3 
                py-2 text-xs leading-5 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{lockMessage}</span>
                </div>
            )}

            {children.length > 0 && (
                <div className="border-t border-border">
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        className={`flex min-h-11 w-full items-center justify-center text-sm font-medium transition-colors
                            ${open ? 'bg-accent text-accent-foreground' 
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}
                    >
                        <span>More options</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"}`} />
                    </button>

                        <div className={`transition-[max-height,opacity,padding] duration-200 
                            ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 py-0'}`}>
                            <div className="space-y-2 rounded-b-md border-t border-border bg-background/80 p-2 shadow-inner">
                                {children.map((child, index) => (
                                    <ToggleSettingItem
                                        key={index}
                                        label={child.label}
                                        description={child.description}
                                        enabled={child.enabled}
                                        onToggle={child.onToggle}
                                        shadow={false}
                                        locked={child.locked}
                                        lockMessage={child.lockMessage}
                                        children={child.children}
                                    />
                                ))}
                            </div>
                        </div>
                </div>
            )}
        </Card>
    );
}
