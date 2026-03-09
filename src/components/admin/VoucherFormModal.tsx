"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Shuffle } from "lucide-react";
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
import { toast } from "sonner";

interface VoucherFormModalProps {
  voucher: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VoucherFormModal({
  voucher,
  onClose,
  onSuccess,
}: VoucherFormModalProps) {
  const isEdit = !!voucher;
  const [loading, setLoading] = useState(false);

  // Form state
  const [code, setCode] = useState(voucher?.code || "");
  const [type, setType] = useState(voucher?.type || "percentage");
  const [value, setValue] = useState(voucher?.value || "");
  const [maxUses, setMaxUses] = useState(voucher?.maxUses || "");
  const [minOrderValue, setMinOrderValue] = useState(
    voucher?.minOrderValue || ""
  );
  const [validFrom, setValidFrom] = useState(
    voucher?.validFrom
      ? new Date(voucher.validFrom).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [validUntil, setValidUntil] = useState(
    voucher?.validUntil
      ? new Date(voucher.validUntil).toISOString().split("T")[0]
      : ""
  );
  const [applicableTo, setApplicableTo] = useState(
    voucher?.applicableTo || "all"
  );
  const [description, setDescription] = useState(voucher?.description || "");

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !type || !value) {
      toast.error("Code, type, and value are required");
      return;
    }

    setLoading(true);

    try {
      const body: any = {
        code,
        type,
        value: parseFloat(value),
        maxUses: maxUses ? parseInt(maxUses) : null,
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        validFrom,
        validUntil: validUntil || null,
        applicableTo,
        description: description || null,
      };

      const url = isEdit
        ? `/api/admin/vouchers/${voucher.id}`
        : "/api/admin/vouchers";
      const method = isEdit ? "PATCH" : "POST";

      // When editing, only send fields that can be changed
      if (isEdit) {
        delete body.code;
        delete body.type;
        delete body.value;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save voucher");
      }

      toast.success(
        isEdit
          ? "Voucher updated successfully"
          : "Voucher created successfully"
      );
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Voucher" : "Create Voucher"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Code */}
          <div>
            <Label htmlFor="code">
              Voucher Code <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                }
                placeholder="WELCOME10"
                className="flex-1 font-mono"
                disabled={isEdit}
                required
              />
              {!isEdit && (
                <Button
                  type="button"
                  onClick={generateCode}
                  variant="outline"
                  className="gap-2"
                >
                  <Shuffle size={16} />
                  Generate
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {isEdit
                ? "Code cannot be changed after creation"
                : "Uppercase letters and numbers only"}
            </p>
          </div>

          {/* Type and Value */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">
                Discount Type <span className="text-red-500">*</span>
              </Label>
              <Select value={type} onValueChange={setType} disabled={isEdit}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (€)</SelectItem>
                </SelectContent>
              </Select>
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Type cannot be changed
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="value">
                {type === "percentage" ? "Percentage" : "Amount (€)"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step={type === "percentage" ? "1" : "0.01"}
                min="0"
                max={type === "percentage" ? "100" : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percentage" ? "10" : "5.00"}
                disabled={isEdit}
                required
              />
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  Value cannot be changed
                </p>
              )}
            </div>
          </div>

          {/* Max Uses and Min Order Value */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxUses">Maximum Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <Label htmlFor="minOrderValue">Minimum Order Value (€)</Label>
              <Input
                id="minOrderValue"
                type="number"
                step="0.01"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Valid Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1"
                placeholder="No expiry"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiry
              </p>
            </div>
          </div>

          {/* Applicable To */}
          <div>
            <Label htmlFor="applicableTo">Applicable To</Label>
            <Select value={applicableTo} onValueChange={setApplicableTo}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="customers">Customers Only</SelectItem>
                <SelectItem value="fixers">Fixers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description (Internal Note)
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Summer promotion, Referral reward..."
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Preview */}
          {code && type && value && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900 mb-2">Preview:</p>
              <p className="text-sm text-blue-800">
                Code <strong className="font-mono">{code}</strong> gives{" "}
                {type === "percentage" ? `${value}% off` : `€${value} off`}
                {minOrderValue
                  ? ` on orders over €${minOrderValue}`
                  : " on any order"}
                .
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading && <Loader2 className="mr-2 animate-spin" size={18} />}
              {isEdit ? "Update Voucher" : "Create Voucher"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
