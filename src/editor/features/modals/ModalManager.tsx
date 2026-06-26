import { useModalStore } from "@/store/useModalStore";
import CreateArrayModal from "./CreateArrayModal";
import SettingsModal from "../settings/button/SettingsButtonModal";
import ComingSoonModal from "./ComingSoonModal";

export default function ModalManager() {
	const { type, isOpen, closeModal } = useModalStore();

	if (!isOpen) return null;

	let modal = null;

	switch (type) {
		case "CREATE_ARRAY":
			modal = <CreateArrayModal isOpen={isOpen} onClose={closeModal} />;
			break;
		case "SETTINGS":
			modal = <SettingsModal isOpen={isOpen} onClose={closeModal} />;
			break;
		case "CREATE_LINKED_LIST":
			modal = (
				<ComingSoonModal
					isOpen={isOpen}
					onClose={closeModal}
					title="Create Linked List"
					description="Linked list visualization is coming soon. Stay tuned!"
				/>
			);
			break;
		case "CREATE_GRAPH":
			modal = (
				<ComingSoonModal
					isOpen={isOpen}
					onClose={closeModal}
					title="Create Graph"
					description="Graph visualization is coming soon. Stay tuned!"
				/>
			);
			break;
		default:
			return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/30 backdrop-blur-sm"
				onClick={closeModal}
			/>
			<div className="relative z-10">{modal}</div>
		</div>
	);
}
