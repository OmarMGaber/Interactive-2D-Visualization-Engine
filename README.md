# Interactive 2D Visualization Engine
Build visualization apps faster with a reusable runtime, editor UI, and system architecture.

This project is a TypeScript-based engine for creating interactive visualizations of data structures and algorithms. It provides a framework for building educational tools that help users understand complex concepts through visual representation and interaction.
With this engine, developers can create visualizations that allow users to manipulate data structures, observe algorithmic processes in action, and gain insights into the behavior of various algorithms.

## This Repository
This repository is both:

- A framework for building interactive 2D visualizations with animations and user interaction.
- A working reference implementation of a visualization app that demonstrates the capabilities of the engine ([Data Structures and Algorithms Visualizer](https://algorithms-visualizer.vercel.app/)).

## Features
- Interactive visualizations of data structures and algorithms.
- Support for user interaction, allowing manipulation of data structures.
- Event-driven architecture for handling visualization events.
- Persistent storage of runtime settings for a consistent user experience.
- Animation support for smooth transitions and visual effects.
- Animation full control over each visualization step, allowing fine-grained manipulation.
- Session management for saving and loading visualization states.
- Extensible architecture for adding new visualizations and system components.

## Why this codebase is useful

Instead of building rendering, interaction, playback, and settings persistence from scratch, you can build on top of this engine and focus on your visualization logic.

| What you get | Why it helps you ship faster |
| --- | --- |
| Runtime + lifecycle management | Start, pause, resume, and destroy visual sessions in a consistent way |
| Event and command channels | Keep modules decoupled while still coordinating complex interactions |
| Systems architecture | Add behavior (drag, zoom, outlines, debug overlays, etc.) as isolated modules |
| Settings tree with persistence | Save and restore runtime/system/visuals configuration automatically |
| Action player and animation control | Step through animation actions and playback state with fine control |
| Editor-side controls and modals | Reuse existing UI patterns to expose visualization tools quickly |

## Architecture at a glance

| Layer | Responsibility |
| --- | --- |
| Engine (`src/engine`) | Runtime orchestration, systems, events, settings, structures, algorithms |
| Editor (`src/editor`) | React-based control panels, modals, settings UI, structure interaction controls |
| Runtime session (`src/RuntimeSession.ts`) | Safe runtime bootstrap and teardown across app lifecycle/HMR |

## Documentation map

Use these docs to understand and extend key areas:

| Area | Documentation |
| --- | --- |
| Editor overview | [`src/editor/README.md`](src/editor/README.md) |
| Editor settings | [`src/editor/settings/README.md`](src/editor/settings/README.md) |
| Editor settings button module | [`src/editor/settings/button/README.md`](src/editor/settings/button/README.md) |
| Runtime systems | [`src/engine/systems/README.md`](src/engine/systems/README.md) |
| Events and messaging | [`src/engine/events/README.md`](src/engine/events/README.md) |
| Settings and persistence | [`src/engine/settings/README.md`](src/engine/settings/README.md) |

## Tech stack

- TypeScript
- React + Vite
- PixiJS (rendering)
- GSAP (animation timing)
- Tailwind CSS + Radix UI patterns

## Quick start

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Type-check (`tsc -b`) and build production bundle |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Live demo

[https://algorithms-visualizer.vercel.app/](https://algorithms-visualizer.vercel.app/)