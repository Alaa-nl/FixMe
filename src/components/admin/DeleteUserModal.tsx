"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface DeleteUserModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeleteUserModal({
  userId,
  userName,
  onClose,
  onDeleted,
}: DeleteUserModalProps) {
  const [deleteType, setDeleteType] = useState<"complete" | "anonymize">(
    "anonymize"
  );
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setLoading(true);

    try {
      const url = `/api/admin/users/${userId}${
        deleteType === "anonymize" ? "?anonymize=true" : ""
      }`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success(
        deleteType === "anonymize"
          ? "User anonymized successfully"
          : "User deleted successfully"
      );

      onDeleted();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              Delete User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. You are
              about to delete the user <strong>{userName}</strong>.
            </p>
          </div>

          {/* Delete Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Deletion Method
            </Label>
            <RadioGroup
              value={deleteType}
              onValueChange={(val: any) => setDeleteType(val)}
            >
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="anonymize" id="anonymize" />
                <div className="flex-1">
                  <Label
                    htmlFor="anonymize"
                    className="font-medium cursor-pointer"
                  >
                    Keep reviews and anonymize
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Replaces the user's name with "Deleted User" and removes
                    personal data. Reviews and job history remain visible but
                    anonymized.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="complete" id="complete" />
                <div className="flex-1">
                  <Label
                    htmlFor="complete"
                    className="font-medium cursor-pointer"
                  >
                    Delete all data
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Permanently deletes the user and all their data including
                    profile, requests, offers, jobs, messages, and reviews.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Confirmation Input */}
          <div>
            <Label htmlFor="confirmDelete" className="font-semibold">
              Type <span className="text-red-600 font-mono">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirmDelete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-2 font-mono"
            />
          </div>

          {/* What will happen */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              What will happen:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {deleteType === "anonymize" ? (
                <>
                  <li>✓ Name changed to "Deleted User"</li>
                  <li>✓ Email anonymized</li>
                  <li>✓ Personal data removed</li>
                  <li>✓ Reviews kept but anonymized</li>
                  <li>✓ Job history visible but anonymized</li>
                  <li>✓ Messages deleted</li>
                </>
              ) : (
                <>
                  <li>✗ All user data deleted</li>
                  <li>✗ Profile completely removed</li>
                  <li>✗ All requests deleted</li>
                  <li>✗ All offers deleted</li>
                  <li>✗ All jobs deleted</li>
                  <li>✗ All messages deleted</li>
                  <li>✗ All reviews deleted</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <Button
            onClick={handleDelete}
            disabled={loading || confirmText !== "DELETE"}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {deleteType === "anonymize" ? "Anonymize User" : "Delete User"}
          </Button>
          <Button onClick={onClose} variant="outline" disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
