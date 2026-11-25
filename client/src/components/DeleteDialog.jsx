import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { AlertTriangle, Trash2 } from "lucide-react";

export function DeleteDialog({
  isOpen,
  onOpenChange,
  title = "Delete this record?",
  description,
  confirmWord = "DELETE",
  actionLabel = "Delete permanently",
  loading = false,
  onConfirm,
}) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen) setText("");
  }, [isOpen]);

  const ready = text.trim().toUpperCase() === confirmWord;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!loading}
      hideCloseButton={loading}
      backdrop="blur"
      size="md"
      classNames={{ base: "border border-white/[0.08] bg-content1" }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <p className="font-display text-lg">{title}</p>
            </ModalHeader>
            <ModalBody>
              <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div className="text-xs leading-relaxed text-default-400">
                  {description ||
                    "This action is irreversible. The record and its related data will be removed from the database."}
                </div>
              </div>
              <Input
                autoFocus
                label={`Type ${confirmWord} to continue`}
                placeholder={confirmWord}
                value={text}
                onValueChange={setText}
                variant="bordered"
                isDisabled={loading}
                classNames={{ inputWrapper: "border-white/10" }}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} isDisabled={loading}>
                Cancel
              </Button>
              <Button
                color="danger"
                startContent={<Trash2 className="h-4 w-4" />}
                isLoading={loading}
                isDisabled={!ready || loading}
                onPress={onConfirm}
              >
                {actionLabel}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
