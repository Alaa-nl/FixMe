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
import { ArrowLeft, Loader2, Search, Wrench } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface CreateRepairRequestFormProps {
  categories: Array<{
    id: string;
    name: string;
    nameNl: string;
  }>;
}

export default function CreateRepairRequestForm({
  categories,
}: CreateRepairRequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Customer selection
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [timeline, setTimeline] = useState<"URGENT" | "THIS_WEEK" | "NO_RUSH">(
    "THIS_WEEK"
  );
  const [mobility, setMobility] = useState<
    "BRING_TO_FIXER" | "FIXER_COMES_TO_ME"
  >("FIXER_COMES_TO_ME");
  const [adminNotes, setAdminNotes] = useState("");

  // Location (for simplicity, using city center coordinates)
  const [locationLat, setLocationLat] = useState("52.3676");
  const [locationLng, setLocationLng] = useState("4.9041");

  const searchCustomer = async () => {
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
        throw new Error(data.error || "Failed to search customer");
      }

      if (data.users && data.users.length > 0) {
        const user = data.users[0];
        setSelectedCustomer(user);
        // Auto-fill city if user has it
        if (user.city) {
          setCity(user.city);
        }
        toast.success(`Found customer: ${user.name}`);
      } else {
        toast.error("No customer found with that email address");
        setSelectedCustomer(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to search customer");
      setSelectedCustomer(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      toast.error("Please search and select a customer first");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/repair-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          title,
          description,
          categoryId,
          locationLat,
          locationLng,
          city,
          address: address || null,
          timeline,
          mobility,
          adminNotes: adminNotes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create repair request");
      }

      toast.success("Repair request created successfully");
      router.push("/admin/jobs");
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
        <Link href="/admin/jobs">
          <Button variant="outline" className="mb-4 gap-2">
            <ArrowLeft size={18} />
            Back to Jobs
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Wrench className="text-primary" />
          Create Repair Request
        </h1>
        <p className="mt-2 text-gray-600">
          Create a repair request on behalf of a customer
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Customer Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Select Customer</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="searchEmail">
                Customer Email <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="searchEmail"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchCustomer();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={searchCustomer}
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
            </div>

            {selectedCustomer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedCustomer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedCustomer.email}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repair Details */}
        {selectedCustomer && (
          <>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">
                Repair Details
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Broken laptop screen"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Location</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Amsterdam"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name and number"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select
                    value={timeline}
                    onValueChange={(val: any) => setTimeline(val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URGENT">Urgent (ASAP)</SelectItem>
                      <SelectItem value="THIS_WEEK">This Week</SelectItem>
                      <SelectItem value="NO_RUSH">No Rush</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mobility">Service Type</Label>
                  <Select
                    value={mobility}
                    onValueChange={(val: any) => setMobility(val)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIXER_COMES_TO_ME">
                        Fixer Comes to Me
                      </SelectItem>
                      <SelectItem value="BRING_TO_FIXER">
                        I'll Bring to Fixer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="border-t pt-6">
              <div>
                <Label htmlFor="adminNotes">
                  Admin Notes (Internal Only)
                </Label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes about this request (not visible to customer or fixers)"
                  rows={3}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Add notes like: "Customer called from phone", "Requested by
                  email support"
                </p>
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
                Create Repair Request
              </Button>
              <Link href="/admin/jobs">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </>
        )}
      </form>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">Usage Notes</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use this when customers call or email support for help</li>
          <li>• The customer will be notified about the new request</li>
          <li>• Fixers can then send offers as usual</li>
          <li>
            • Admin notes are internal only - not visible to customer or fixers
          </li>
        </ul>
      </div>
    </div>
  );
}
