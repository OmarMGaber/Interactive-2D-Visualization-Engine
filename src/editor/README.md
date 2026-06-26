# Editor UI

React overlay for the visualization runtime.

## Layout

```
src/editor/
├── components/
│   ├── cards/          # Reusable control cards (parent-driven props)
│   └── engine/         # Canvas shell, context menu, startup overlay
├── features/
│   ├── array/          # Array-specific controls
│   ├── modals/         # Create dialogs and modal manager
│   ├── settings/       # Global settings UI
│   └── structures/     # Structure selection hub
├── hooks/              # Shared editor hooks
├── layouts/            # Responsive shell composition
├── styles/             # Shared editor CSS utilities
├── constants/          # Z-index and UI constants
└── notifications/      # Runtime event to toast adapter
```

## Conventions

- **Cards are closed components.** They receive data and callbacks from parent panels; they do not talk to the runtime directly (except registry cards that encapsulate one concern).
- **Shared styling** lives in `styles/editor.css` (`editor-panel`, `editor-dock`, `editor-muted`, …).
- **Mobile:** structure controls use a bottom dock with safe-area padding; long-press opens the create menu; global ticker controls appear in the settings modal on small screens.

## Playback flow (array demo)

1. Select an array on the canvas.
2. Pick a sorting algorithm.
3. Click **Run Selected Algorithm** — the engine records actions, resets the visual, then plays them step-by-step.
4. Use play/pause, step, and reset controls to inspect the animation.

Commands: `player:run`, `player:pause`, `player:resume`, `player:step`, `player:reset`.
