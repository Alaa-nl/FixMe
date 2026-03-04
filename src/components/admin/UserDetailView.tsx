"use client";

import { useEffect, useState } from "react";
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
import {
  ArrowLeft,
  Loader2,
  Save,
  Key,
  Ban,
  UserX,
  Trash2,
  Shield,
  UserCog,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import DeleteUserModal from "./DeleteUserModal";

interface UserDetailViewProps {
  userId: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canBan: boolean;
    canCreateStaff: boolean;
  };
}

export default function UserDetailView({
  userId,
  permissions,
}: UserDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User data
  const [user, setUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Edit fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [userType, setUserType] = useState("");

  // Fixer fields
  const [kvkNumber, setKvkNumber] = useState("");
  const [bio, setBio] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState("10");
  const [minJobFee, setMinJobFee] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user");
      }

      setUser(data.user);
      setStatistics(data.statistics);
      setRecentActivity(data.recentActivity || []);

      // Populate form fields
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setPhone(data.user.phone || "");
      setCity(data.user.city || "");
      setUserType(data.user.userType || "");

      if (data.user.fixerProfile) {
        setKvkNumber(data.user.fixerProfile.kvkNumber || "");
        setBio(data.user.fixerProfile.bio || "");
        setServiceRadiusKm(
          String(data.user.fixerProfile.serviceRadiusKm || 10)
        );
        setMinJobFee(
          data.user.fixerProfile.minJobFee
            ? String(data.user.fixerProfile.minJobFee)
            : ""
        );
        setSkills(data.user.fixerProfile.skills || []);
        setIsActive(data.user.fixerProfile.isActive);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!permissions.canEdit) {
      toast.error("You don't have permission to edit users");
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        name,
        email,
        phone: phone || null,
        city: city || null,
        userType,
      };

      // Add fixer fields if applicable
      if (user.fixerProfile || userType === "FIXER") {
        payload.kvkNumber = kvkNumber || null;
        payload.bio = bio || null;
        payload.skills = skills;
        payload.serviceRadiusKm = serviceRadiusKm;
        payload.minJobFee = minJobFee || null;
        payload.isActive = isActive;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      fetchUserData();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!permissions.canEdit) {
      toast.error("You don't have permission to reset passwords");
      return;
    }

    if (!confirm("Reset this user's password? A new password will be generated.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      toast.success(`Password reset! New password: ${data.newPassword}`);
      // In production, this would be sent via email
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  const handleBan = async () => {
    if (!permissions.canBan) {
      toast.error("You don't have permission to ban users");
      return;
    }

    const reason = prompt("Reason for banning this user:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to ban user");
      }

      toast.success("User banned successfully");
      fetchUserData();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to ban user");
    }
  };

  const handleUnban = async () => {
    if (!permissions.canBan) {
      toast.error("You don't have permission to unban users");
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to unban user");
      }

      toast.success("User unbanned successfully");
      fetchUserData();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to unban user");
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#FF6B35]" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
        <Link href="/admin/users">
          <Button className="mt-4" variant="outline">
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/users">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft size={18} />
            Back to Users
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <UserCog className="text-[#FF6B35]" />
              {user.name}
            </h1>
            <p className="mt-2 text-gray-600">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isBanned
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user.isBanned ? "Banned" : "Active"}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.userType}
              </span>
              {user.fixerProfile?.kvkVerified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <CheckCircle size={12} className="mr-1" />
                  KVK Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      {statistics && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Spent</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              €{statistics.totalSpent.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Earned</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              €{statistics.totalEarned.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Jobs Completed</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {statistics.completedJobsAsCustomer + statistics.completedJobsAsFixer}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {statistics.averageRating.toFixed(1)} ⭐
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">
              User Information
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!permissions.canEdit}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!permissions.canEdit}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!permissions.canEdit}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!permissions.canEdit}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="userType">User Type</Label>
                <Select
                  value={userType}
                  onValueChange={setUserType}
                  disabled={!permissions.canEdit}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="FIXER">Fixer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fixer Profile */}
            {(user.fixerProfile || userType === "FIXER") && (
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Fixer Profile</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="kvk">KVK Number</Label>
                    <Input
                      id="kvk"
                      value={kvkNumber}
                      onChange={(e) => setKvkNumber(e.target.value)}
                      disabled={!permissions.canEdit}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="radius">Service Radius (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      value={serviceRadiusKm}
                      onChange={(e) => setServiceRadiusKm(e.target.value)}
                      disabled={!permissions.canEdit}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minFee">Min Job Fee (€)</Label>
                    <Input
                      id="minFee"
                      type="number"
                      step="0.01"
                      value={minJobFee}
                      onChange={(e) => setMinJobFee(e.target.value)}
                      disabled={!permissions.canEdit}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={isActive ? "active" : "inactive"}
                      onValueChange={(val) => setIsActive(val === "active")}
                      disabled={!permissions.canEdit}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="skills">Skills</Label>
                  {permissions.canEdit && (
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Add a skill"
                      />
                      <Button type="button" onClick={addSkill} variant="outline">
                        Add
                      </Button>
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill}
                          {permissions.canEdit && (
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="hover:text-blue-900"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!permissions.canEdit}
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                  />
                </div>
              </div>
            )}

            {permissions.canEdit && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Actions & Activity */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

            {permissions.canEdit && (
              <Button
                onClick={handleResetPassword}
                variant="outline"
                className="w-full gap-2"
              >
                <Key size={18} />
                Reset Password
              </Button>
            )}

            {permissions.canBan &&
              (user.isBanned ? (
                <Button
                  onClick={handleUnban}
                  variant="outline"
                  className="w-full gap-2 text-green-600 hover:text-green-700"
                >
                  <CheckCircle size={18} />
                  Unban User
                </Button>
              ) : (
                <Button
                  onClick={handleBan}
                  variant="outline"
                  className="w-full gap-2 text-orange-600 hover:text-orange-700"
                >
                  <Ban size={18} />
                  Ban User
                </Button>
              ))}

            {permissions.canDelete && (
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                className="w-full gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
                Delete User
              </Button>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity, index) => (
                  <div
                    key={index}
                    className="text-sm border-l-2 border-blue-500 pl-3"
                  >
                    <div className="font-medium text-gray-900">
                      {activity.type === "repair_request"
                        ? "Created Request"
                        : activity.type === "offer"
                        ? "Made Offer"
                        : "Job Activity"}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteUserModal
          userId={userId}
          userName={user.name}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            router.push("/admin/users");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
