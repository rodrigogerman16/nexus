"use client";

import { useState } from "react";
import { deleteAllUserData } from "@/lib/account/dataManagement";
import { toast } from "@/lib/store/useToastStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Row } from "@/components/settings/SettingsLayout";

const DELETE_CONFIRM_PHRASE = "DELETE";

export function DeleteAllDataDialog({ userId }: { userId: string | null }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setConfirmText("");
  }

  async function handleConfirm() {
    if (!userId || confirmText !== DELETE_CONFIRM_PHRASE) return;
    setDeleting(true);
    const { error } = await deleteAllUserData(userId);
    setDeleting(false);
    if (error) {
      toast.error("Couldn't delete your data — try again.");
      return;
    }
    setOpen(false);
    setConfirmText("");
    toast.success("All your data has been deleted.");
  }

  return (
    <>
      <Row label="Delete all data" hint="Permanently delete every task, project, note, and event.">
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          Delete all data
        </Button>
      </Row>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>Delete all your data?</DialogTitle>
          <DialogDescription>
            This permanently deletes every task, project, note, event, habit, goal, and activity
            entry tied to your account. This can&rsquo;t be undone.
          </DialogDescription>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Type {DELETE_CONFIRM_PHRASE} to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={DELETE_CONFIRM_PHRASE}
              autoFocus
            />
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={confirmText !== DELETE_CONFIRM_PHRASE || deleting}
              onClick={handleConfirm}
            >
              {deleting ? "Deleting…" : "Permanently delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
