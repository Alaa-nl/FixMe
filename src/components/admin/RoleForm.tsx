"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ALL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  ROLE_TEMPLATES,
  RoleTemplateName,
} from "@/lib/permissions";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface RoleFormProps {
  mode: "create" | "edit";
  roleId?: string;
  initialData?: {
    name: string;
    description: string;
    permissions: string[];
  };
}

export default function RoleForm({ mode, roleId, initialData }: RoleFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(initialData?.permissions || [])
  );

  const togglePermission = (permission: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permission)) {
      newPermissions.delete(permission);
    } else {
      newPermissions.add(permission);
    }
    setSelectedPermissions(newPermissions);
  };

  const toggleCategory = (category: string) => {
    const categoryPermissions =
      PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    const allSelected = categoryPermissions.every((p) =>
      selectedPermissions.has(p)
    );

    const newPermissions = new Set(selectedPermissions);
    if (allSelected) {
      // Unselect all in category
      categoryPermissions.forEach((p) => newPermissions.delete(p));
    } else {
      // Select all in category
      categoryPermissions.forEach((p) => newPermissions.add(p));
    }
    setSelectedPermissions(newPermissions);
  };

  const selectAll = () => {
    const allPermissions = Object.keys(ALL_PERMISSIONS);
    setSelectedPermissions(new Set(allPermissions));
  };

  const deselectAll = () => {
    setSelectedPermissions(new Set());
  };

  const loadTemplate = (templateName: RoleTemplateName) => {
    const template = ROLE_TEMPLATES[templateName];
    setName(templateName);
    setDescription(template.description);
    setSelectedPermissions(new Set(template.permissions));
    toast.success(`Loaded template: ${templateName}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Role name is required");
      return;
    }

    if (selectedPermissions.size === 0) {
      toast.error("Select at least one permission");
      return;
    }

    setLoading(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/staff/roles"
          : `/api/admin/staff/roles/${roleId}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          permissions: Array.from(selectedPermissions),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save role");
      }

      toast.success(
        mode === "create" ? "Role created successfully" : "Role updated successfully"
      );
      router.push("/admin/staff/roles");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/staff/roles">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft size={18} />
            Back to Roles
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="text-primary" />
          {mode === "create" ? "Create New Role" : "Edit Role"}
        </h1>
        <p className="mt-2 text-gray-600">
          Define a role with custom permissions for staff members
        </p>
      </div>

      {/* Template Selection */}
      {mode === "create" && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            Start from a template
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(ROLE_TEMPLATES).map((templateName) => (
              <Button
                key={templateName}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadTemplate(templateName as RoleTemplateName)}
                className="bg-white hover:bg-blue-50"
              >
                {templateName}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Dispute Manager"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this role's responsibilities"
              className="mt-1"
            />
          </div>
        </div>

        {/* Permissions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-semibold">
              Permissions <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={deselectAll}
              >
                Deselect All
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => {
              const allSelected = permissions.every((p) =>
                selectedPermissions.has(p)
              );
              const someSelected = permissions.some((p) =>
                selectedPermissions.has(p)
              );

              return (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Checkbox
                      id={`category-${category}`}
                      checked={allSelected}
                      onCheckedChange={() => toggleCategory(category)}
                      className={someSelected && !allSelected ? "opacity-50" : ""}
                    />
                    <Label
                      htmlFor={`category-${category}`}
                      className="text-base font-semibold text-gray-900 cursor-pointer"
                    >
                      {category}
                    </Label>
                    <span className="text-sm text-gray-500">
                      ({permissions.filter((p) => selectedPermissions.has(p)).length}/
                      {permissions.length})
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 ml-6">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-start gap-2">
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.has(permission)}
                          onCheckedChange={() => togglePermission(permission)}
                        />
                        <Label
                          htmlFor={permission}
                          className="text-sm cursor-pointer leading-tight"
                        >
                          {ALL_PERMISSIONS[permission as keyof typeof ALL_PERMISSIONS]}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Count */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-700">
            <strong>{selectedPermissions.size}</strong> permission
            {selectedPermissions.size !== 1 ? "s" : ""} selected
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading && <Loader2 className="mr-2 animate-spin" size={18} />}
            {mode === "create" ? "Create Role" : "Update Role"}
          </Button>
          <Link href="/admin/staff/roles">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• ADMIN users always have ALL permissions (cannot be changed)</li>
          <li>• Staff members will only have the permissions you select here</li>
          <li>• Permissions are enforced both in the UI and on the server</li>
          <li>
            • You can edit role permissions later, affecting all staff with this role
          </li>
        </ul>
      </div>
    </div>
  );
}
