"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateUserForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Basic fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"CUSTOMER" | "FIXER" | "ADMIN">("CUSTOMER");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Fixer specific fields
  const [kvkNumber, setKvkNumber] = useState("");
  const [bio, setBio] = useState("");
  const [serviceRadiusKm, setServiceRadiusKm] = useState("10");
  const [minJobFee, setMinJobFee] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email, and password are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        password,
        userType,
        city: city.trim() || null,
        phone: phone.trim() || null,
        sendWelcomeEmail,
      };

      // Add fixer specific fields if user type is FIXER
      if (userType === "FIXER") {
        payload.kvkNumber = kvkNumber.trim() || null;
        payload.bio = bio.trim() || null;
        payload.skills = skills;
        payload.serviceRadiusKm = serviceRadiusKm;
        payload.minJobFee = minJobFee || null;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      toast.success("User created successfully");
      router.push(`/admin/users/${data.user.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/users">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft size={18} />
            Back to Users
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlus className="text-primary" />
          Create New User
        </h1>
        <p className="mt-2 text-gray-600">
          Add a new user to the platform
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="mt-1"
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="userType">
                User Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={userType}
                onValueChange={(value: any) => setUserType(value)}
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

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+31 6 12345678"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Amsterdam"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Fixer Specific Fields */}
        {userType === "FIXER" && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Fixer Profile
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kvkNumber">KVK Number</Label>
                  <Input
                    id="kvkNumber"
                    value={kvkNumber}
                    onChange={(e) => setKvkNumber(e.target.value)}
                    placeholder="12345678"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="serviceRadius">
                    Service Radius (km)
                  </Label>
                  <Input
                    id="serviceRadius"
                    type="number"
                    value={serviceRadiusKm}
                    onChange={(e) => setServiceRadiusKm(e.target.value)}
                    min="1"
                    max="100"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minJobFee">Min Job Fee (€)</Label>
                  <Input
                    id="minJobFee"
                    type="number"
                    step="0.01"
                    value={minJobFee}
                    onChange={(e) => setMinJobFee(e.target.value)}
                    placeholder="25.00"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="skills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Type a skill and press Enter"
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
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
                  placeholder="Tell us about your experience..."
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="sendWelcomeEmail"
              checked={sendWelcomeEmail}
              onCheckedChange={(checked) =>
                setSendWelcomeEmail(checked as boolean)
              }
            />
            <Label
              htmlFor="sendWelcomeEmail"
              className="cursor-pointer font-normal"
            >
              Send welcome email with login credentials
            </Label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading && <Loader2 className="mr-2 animate-spin" size={18} />}
            Create User
          </Button>
          <Link href="/admin/users">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
