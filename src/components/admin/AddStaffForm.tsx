"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface AddStaffFormProps {
  roles: Role[];
}

export default function AddStaffForm({ roles }: AddStaffFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Form fields
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [roleId, setRoleId] = useState("");
  const [notes, setNotes] = useState("");

  const searchUser = async () => {
    if (!searchEmail.trim()) {
      toast.error("Enter an email address to search");
      return;
    }

    setSearchLoading(true);

    try {
      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(searchEmail.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search user");
      }

      if (data.users && data.users.length > 0) {
        setSelectedUser(data.users[0]);
        toast.success(`Found user: ${data.users[0].name}`);
      } else {
        toast.error("No user found with that email address");
        setSelectedUser(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search user");
      setSelectedUser(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error("Please search and select a user first");
      return;
    }

    if (!roleId) {
      toast.error("Please select a role");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          roleId,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add staff member");
      }

      toast.success("Staff member added successfully");
      router.push("/admin/staff");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/staff">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft size={18} />
            Back to Staff
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlus className="text-[#FF6B35]" />
          Add Staff Member
        </h1>
        <p className="mt-2 text-gray-600">
          Add an existing user as a staff member with a specific role
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* User Search */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="searchEmail">
              Search User by Email <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="searchEmail"
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchUser();
                  }
                }}
              />
              <Button
                type="button"
                onClick={searchUser}
                disabled={searchLoading}
                variant="outline"
                className="gap-2"
              >
                {searchLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Search size={18} />
                )}
                Search
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              The user must already have a FixMe account
            </p>
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-semibold text-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedUser.name}
                  </div>
                  <div className="text-sm text-gray-600">{selectedUser.email}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Role Selection */}
        {selectedUser && (
          <>
            <div>
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        {role.description && (
                          <div className="text-xs text-gray-500">
                            {role.description}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {roles.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  No roles available. Please{" "}
                  <Link href="/admin/staff/roles/new" className="underline">
                    create a role
                  </Link>{" "}
                  first.
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Part-time, Summer intern, etc."
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add any additional information about this staff member
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || !roleId}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
              >
                {loading && <Loader2 className="mr-2 animate-spin" size={18} />}
                Add Staff Member
              </Button>
              <Link href="/admin/staff">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </>
        )}
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          How Staff Access Works
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • The user's account type (CUSTOMER/FIXER) stays the same
          </li>
          <li>• They gain access to the admin panel with their assigned permissions</li>
          <li>• They can toggle between their normal dashboard and the staff panel</li>
          <li>
            • The user will receive an email notification about their new staff access
          </li>
          <li>• You can deactivate their staff access anytime without deleting their account</li>
        </ul>
      </div>

      {/* No Roles Warning */}
      {roles.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            No Roles Available
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            You need to create at least one role before adding staff members.
          </p>
          <Link href="/admin/staff/roles/new">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
              Create a Role
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
