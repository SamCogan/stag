import { TrashIcon } from "@phosphor-icons/react/Trash";
import { WarningCircleIcon } from "@phosphor-icons/react/WarningCircle";
import { XCircleIcon } from "@phosphor-icons/react/XCircle";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

import type { ReactNode } from "react";

interface ConfirmDialogProperties {
  cancelLabel?: string;
  children: ReactNode;
  confirmLabel: string;
  description: string;
  onConfirm: () => void;
  title: string;
}

export const ConfirmDialog = ({
  cancelLabel = "Cancel",
  children,
  confirmLabel,
  description,
  onConfirm,
  title,
}: ConfirmDialogProperties) => (
  <AlertDialog.Root>
    <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
      <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100%-2rem))] -translate-1/2 rounded-box border border-base-300 bg-base-100 p-6 shadow-xl">
        <AlertDialog.Title className="flex items-center gap-2 text-lg font-bold">
          <WarningCircleIcon
            aria-hidden="true"
            className="text-error"
            size={24}
            weight="duotone"
          />
          {title}
        </AlertDialog.Title>
        <AlertDialog.Description className="mt-2 text-sm text-base-content/70">
          {description}
        </AlertDialog.Description>
        <div className="mt-6 flex justify-end gap-2">
          <AlertDialog.Cancel asChild>
            <button className="btn btn-ghost" type="button">
              <XCircleIcon aria-hidden="true" size={18} weight="duotone" />
              {cancelLabel}
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button className="btn btn-error" onClick={onConfirm} type="button">
              <TrashIcon aria-hidden="true" size={18} weight="duotone" />
              {confirmLabel}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
