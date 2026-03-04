"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Loader2,
  Euro,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
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

interface UserCreditData {
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
  };
  balance: number;
  totalAdded: number;
  totalUsed: number;
  transactions: Array<{
    id: string;
    amount: number;
    balance: number;
    reason: string;
    createdAt: string;
    createdBy: string | null;
  }>;
}

export default function CreditManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditData, setCreditData] = useState<UserCreditData | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  // Add credit form
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("compensation");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const searchUser = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter an email address or name");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search user");
      }

      if (data.users && data.users.length > 0) {
        const user = data.users[0];
        setSelectedUser(user);
        await loadUserCredits(user.id);
      } else {
        toast.error("No user found with that email or name");
        setSelectedUser(null);
        setCreditData(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search user");
    } finally {
      setSearching(false);
    }
  };

  const loadUserCredits = async (userId: string) => {
    setLoadingCredits(true);
    try {
      const response = await fetch(`/api/admin/credits/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load credits");
      }

      setCreditData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load credits");
      setCreditData(null);
    } finally {
      setLoadingCredits(false);
    }
  };

  const handleAddCredit = async () => {
    if (!selectedUser || !amount || !reason) {
      toast.error("Amount and reason are required");
      return;
    }

    const creditAmount = parseFloat(amount);
    if (isNaN(creditAmount) || creditAmount === 0) {
      toast.error("Invalid amount");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: creditAmount,
          reason,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to manage credit");
      }

      toast.success(data.message);
      setAmount("");
      setNote("");
      setShowAddForm(false);
      await loadUserCredits(selectedUser.id);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const reasonLabels: Record<string, string> = {
    compensation: "Compensation",
    welcome_bonus: "Welcome Bonus",
    referral_reward: "Referral Reward",
    goodwill: "Goodwill Gesture",
    refund_bonus: "Refund Bonus",
    other: "Other",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Credit Management
        </h1>
        <p className="mt-2 text-gray-600">
          Add or remove credit for users
        </p>
      </div>

      {/* Search User */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Search User</h2>
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Email or name"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchUser();
              }
            }}
          />
          <Button
            onClick={searchUser}
            disabled={searching}
            className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
          >
            {searching ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Search size={18} />
            )}
          </Button>
        </div>
      </div>

      {/* Selected User Info */}
      {selectedUser && creditData && (
        <>
          {/* User Card */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                <p className="text-blue-100">{selectedUser.email}</p>
                <p className="text-sm text-blue-200 mt-1">
                  {selectedUser.userType}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Current Balance</p>
                <p className="text-4xl font-bold">
                  €{creditData.balance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  <div>
                    <p className="text-xs text-blue-100">Total Added</p>
                    <p className="text-lg font-bold">
                      €{creditData.totalAdded.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <TrendingDown size={20} />
                  <div>
                    <p className="text-xs text-blue-100">Total Used</p>
                    <p className="text-lg font-bold">
                      €{creditData.totalUsed.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add/Remove Credit */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Credit
              </h2>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
              >
                {showAddForm ? "Cancel" : "Add/Remove Credit"}
              </Button>
            </div>

            {showAddForm && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">
                      Amount (€) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10.00 or -5.00"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Positive to add, negative to remove
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="reason">
                      Reason <span className="text-red-500">*</span>
                    </Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(reasonLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="note">Additional Note (Optional)</Label>
                  <Input
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g., Ticket #123, Customer complaint..."
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handleAddCredit}
                  disabled={submitting}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                >
                  {submitting && (
                    <Loader2 className="mr-2 animate-spin" size={18} />
                  )}
                  {parseFloat(amount || "0") >= 0 ? "Add" : "Remove"} Credit
                </Button>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Transaction History
              </h2>
            </div>

            {loadingCredits ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : creditData.transactions.length === 0 ? (
              <div className="text-center py-12">
                <Euro className="mx-auto text-gray-300" size={48} />
                <p className="mt-4 text-gray-600">No transactions yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Balance After
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {creditData.transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            {formatDate(transaction.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-bold ${
                              transaction.amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.amount >= 0 ? "+" : ""}€
                            {transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {transaction.reason}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          €{transaction.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
