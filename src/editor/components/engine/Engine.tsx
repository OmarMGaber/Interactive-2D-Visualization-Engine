import { useModalStore } from "@/store/useModalStore";
import { Link2, Rows, Share2 } from "lucide-react";
import EngineContextMenu, { type MenuItem } from "./EngineContextMenu";
import VisualizerCanvas, { type RuntimeStatusCallback } from "./RuntimeCanvas";

type EngineProps = {
  runtimeReady: boolean;
  onRuntimeStatusChange?: RuntimeStatusCallback;
};

/**
 * Renders the engine canvas and context menu for creating new visual objects.
 * 
 * @param runtimeReady Whether the runtime is ready to accept new visual objects.
 * @param onRuntimeStatusChange Optional callback for when the runtime status changes (e.g. paused, resumed, etc.).
 */
export default function Engine({ runtimeReady, onRuntimeStatusChange }: EngineProps) {
  const openModal = useModalStore((state) => state.openModal);

  const menuItems: MenuItem[] = [
    { 
      label: "Create New Array", 
      icon: Rows, 
      onClick: () => openModal("CREATE_ARRAY") 
    },
    { 
      label: "Create New Linked List", 
      icon: Link2, 
      onClick: () => openModal("CREATE_LINKED_LIST") 
    },
    { 
      label: "Create New Graph", 
      icon: Share2, 
      onClick: () => openModal("CREATE_GRAPH") 
    },
  ];

  return (
    <div className="absolute inset-0 z-0">
      <VisualizerCanvas onRuntimeStatusChange={onRuntimeStatusChange} />
      {runtimeReady ? <EngineContextMenu items={menuItems} /> : null}
    </div>
  );
}