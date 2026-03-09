"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Image as ImageIcon,
  Code,
  Loader2,
  Save,
  RotateCcw,
  Check,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ContentItem {
  id: string;
  section: string;
  type: string;
  value: string;
  label: string;
  updatedAt: string;
  updatedBy: string | null;
}

export default function ContentManagementPage() {
  const [content, setContent] = useState<Record<string, ContentItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [markdownPreview, setMarkdownPreview] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/content");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch content");
      }

      setContent(data.content || {});

      // Select first section by default
      const sections = Object.keys(data.content || {});
      if (sections.length > 0 && !selectedSection) {
        setSelectedSection(sections[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setEditValue(item.value);
    setSavedItemId(null);
    setMarkdownPreview(false);
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/content/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save content");
      }

      toast.success("Content saved successfully");
      setSavedItemId(editingItem.id);

      // Update local state
      const updatedContent = { ...content };
      const sectionItems = updatedContent[editingItem.section];
      const itemIndex = sectionItems.findIndex((i) => i.id === editingItem.id);
      if (itemIndex !== -1) {
        sectionItems[itemIndex] = { ...editingItem, value: editValue };
      }
      setContent(updatedContent);

      setEditingItem(null);
      setEditValue("");

      // Clear saved indicator after 2 seconds
      setTimeout(() => setSavedItemId(null), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (item: ContentItem) => {
    if (!confirm(`Reset "${item.label}" to default value?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/reset/${item.id}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset content");
      }

      toast.success("Content reset to default");
      fetchContent();
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to reset content");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon size={16} className="text-purple-600" />;
      case "markdown":
        return <Code size={16} className="text-blue-600" />;
      case "html":
        return <Code size={16} className="text-blue-600" />;
      default:
        return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getSectionLabel = (section: string) => {
    return section
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const sections = Object.keys(content);
  const currentItems = content[selectedSection] || [];

  // Filter items by search query (matches label or id)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return currentItems;
    const q = searchQuery.toLowerCase();
    return currentItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.value.toLowerCase().includes(q)
    );
  }, [currentItems, searchQuery]);

  // Count total items across all sections for search across all
  const totalItems = useMemo(() => {
    return Object.values(content).reduce((sum, items) => sum + items.length, 0);
  }, [content]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="mt-2 text-gray-600">
            Edit marketing text and images across the website ({totalItems} items across {sections.length} sections)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sections Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-4">
              <h2 className="font-bold text-gray-900 mb-3">Sections</h2>
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => {
                      setSelectedSection(section);
                      setEditingItem(null);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSection === section
                        ? "bg-primary text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {getSectionLabel(section)}
                    <span className="ml-2 text-xs opacity-75">
                      ({content[section].length})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {getSectionLabel(selectedSection)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredItems.length === currentItems.length
                        ? `${currentItems.length} items`
                        : `${filteredItems.length} of ${currentItems.length} items`}
                    </p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by label, key, or value..."
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="p-6 space-y-4">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery
                      ? `No items matching "${searchQuery}"`
                      : "No content items in this section"}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-colors ${
                        editingItem?.id === item.id
                          ? "border-primary bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getIcon(item.type)}
                          <Label className="font-semibold text-gray-900">
                            {item.label}
                          </Label>
                          {item.type === "markdown" && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Markdown
                            </span>
                          )}
                          {savedItemId === item.id && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <Check size={14} />
                              Saved
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {editingItem?.id === item.id ? (
                            <>
                              {item.type === "markdown" && (
                                <Button
                                  onClick={() => setMarkdownPreview(!markdownPreview)}
                                  size="sm"
                                  variant="outline"
                                  title={markdownPreview ? "Edit" : "Preview"}
                                >
                                  {markdownPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                </Button>
                              )}
                              <Button
                                onClick={handleSave}
                                disabled={saving}
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                              >
                                {saving ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <Save size={14} />
                                )}
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingItem(null);
                                  setEditValue("");
                                  setMarkdownPreview(false);
                                }}
                                size="sm"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => handleEdit(item)}
                                size="sm"
                                variant="outline"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleReset(item)}
                                size="sm"
                                variant="outline"
                                title="Reset to default"
                              >
                                <RotateCcw size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {editingItem?.id === item.id ? (
                        <div className="mt-2">
                          {item.type === "markdown" ? (
                            markdownPreview ? (
                              <div className="border rounded-lg p-4 bg-white prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-primary">
                                <ReactMarkdown>{editValue}</ReactMarkdown>
                              </div>
                            ) : (
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={20}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter markdown content..."
                              />
                            )
                          ) : item.type === "text" && editValue.length <= 100 ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="font-mono text-sm"
                            />
                          ) : (
                            <textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              rows={item.type === "html" ? 8 : 4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {item.type === "image"
                              ? "Enter image URL or path"
                              : item.type === "markdown"
                              ? `${editValue.length} characters · Use markdown syntax for formatting`
                              : `${editValue.length} characters`}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {item.type === "image" ? (
                            <div>
                              <div className="text-sm text-gray-600 font-mono mb-2">
                                {item.value}
                              </div>
                              {item.value && (
                                <img
                                  src={item.value}
                                  alt={item.label}
                                  className="max-w-xs rounded-lg border"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display =
                                      "none";
                                  }}
                                />
                              )}
                            </div>
                          ) : item.type === "markdown" ? (
                            <div className="text-sm text-gray-700 max-h-32 overflow-hidden relative">
                              <div className="font-mono whitespace-pre-wrap">
                                {item.value.length > 200
                                  ? item.value.slice(0, 200) + "..."
                                  : item.value}
                              </div>
                              {item.value.length > 200 && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {item.value}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        ID: <code className="font-mono">{item.id}</code>
                        {item.updatedAt && (
                          <span className="ml-3">
                            Last updated:{" "}
                            {new Date(item.updatedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
