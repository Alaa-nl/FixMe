"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import RequestCard from "@/components/request/RequestCard";
import { Search, List, Map, MapPinOff, SearchX } from "lucide-react";

// Dynamically import MapView with SSR disabled
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface RepairRequest {
  id: string;
  title: string;
  photos: string[];
  city: string;
  locationLat: number;
  locationLng: number;
  timeline: "URGENT" | "THIS_WEEK" | "NO_RUSH";
  createdAt: string;
  category: {
    name: string;
    slug: string;
  };
  customer: {
    name: string;
    avatarUrl: string | null;
  };
  _count: {
    offers: number;
  };
  distanceKm?: number;
}

interface FixerLocation {
  lat: number;
  lng: number;
  radiusKm: number;
}

interface BrowseClientProps {
  content: Record<string, string>;
}

export default function BrowsePageWrapper({ content }: BrowseClientProps) {
  return (
    <Suspense fallback={<div className="flex-1 bg-gray-50 flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>}>
      <BrowsePage content={content} />
    </Suspense>
  );
}

function BrowsePage({ content }: BrowseClientProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [selectedMobility, setSelectedMobility] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Sync search state with URL params (e.g. navigating from navbar search)
  useEffect(() => {
    const urlQuery = searchParams?.get("q") || "";
    if (urlQuery && urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
      setDebouncedQuery(urlQuery);
    }
  }, [searchParams]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fixerLocation, setFixerLocation] = useState<FixerLocation | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to page 1 when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch fixer location for distance filtering
  useEffect(() => {
    if (session?.user?.userType !== "FIXER") return;

    const fetchFixerLocation = async () => {
      try {
        const res = await fetch("/api/profile/location");
        if (res.ok) {
          const data = await res.json();
          if (data.lat && data.lng) {
            setFixerLocation({
              lat: data.lat,
              lng: data.lng,
              radiusKm: data.radiusKm || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching fixer location:", error);
      }
    };
    fetchFixerLocation();
  }, [session?.user?.userType]);

  // Fetch repair requests
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        sort,
      });

      if (debouncedQuery) params.append("q", debouncedQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedTimeline) params.append("timeline", selectedTimeline);
      if (selectedMobility) params.append("mobility", selectedMobility);
      if (selectedCity) params.append("city", selectedCity);

      // Pass fixer location for distance calculation and radius filtering
      if (fixerLocation) {
        params.append("fixerLat", fixerLocation.lat.toString());
        params.append("fixerLng", fixerLocation.lng.toString());
        if (fixerLocation.radiusKm > 0) {
          params.append("fixerRadiusKm", fixerLocation.radiusKm.toString());
        }
      }

      const res = await fetch(`/api/requests/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, selectedCategory, selectedTimeline, selectedMobility, selectedCity, sort, page, fixerLocation]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedCategory("");
    setSelectedTimeline("");
    setSelectedMobility("");
    setSelectedCity("");
    setSort("newest");
    setPage(1);
  };

  // Handle filter changes (reset to page 1)
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const cities = ["Amsterdam", "Rotterdam", "Utrecht", "The Hague", "Eindhoven"];

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {content["browse_title"]}
          </h1>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={content["browse_search_placeholder"]}
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{content["browse_filter_category"]}</h3>
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleFilterChange(setSelectedCategory, "")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === ""
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_category_all"]}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange(setSelectedCategory, category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.slug
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{content["browse_filter_timeline"]}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange(setSelectedTimeline, "")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeline === ""
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_timeline_all"]}
              </button>
              <button
                onClick={() => handleFilterChange(setSelectedTimeline, "URGENT")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeline === "URGENT"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_timeline_urgent"]}
              </button>
              <button
                onClick={() => handleFilterChange(setSelectedTimeline, "THIS_WEEK")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeline === "THIS_WEEK"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_timeline_week"]}
              </button>
              <button
                onClick={() => handleFilterChange(setSelectedTimeline, "NO_RUSH")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTimeline === "NO_RUSH"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_timeline_no_rush"]}
              </button>
            </div>
          </div>

          {/* Mobility Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{content["browse_filter_mobility"]}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange(setSelectedMobility, "")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMobility === ""
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_mobility_all"]}
              </button>
              <button
                onClick={() => handleFilterChange(setSelectedMobility, "BRING_TO_FIXER")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMobility === "BRING_TO_FIXER"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_mobility_bring"]}
              </button>
              <button
                onClick={() => handleFilterChange(setSelectedMobility, "FIXER_COMES_TO_ME")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMobility === "FIXER_COMES_TO_ME"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_mobility_comes"]}
              </button>
            </div>
          </div>

          {/* City Filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{content["browse_filter_city"]}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange(setSelectedCity, "")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCity === ""
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {content["browse_filter_city_all"]}
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleFilterChange(setSelectedCity, city)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCity === city
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Sort and Clear */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-700 mr-3">{content["browse_sort_label"]}</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">{content["browse_sort_newest"]}</option>
                <option value="oldest">{content["browse_sort_oldest"]}</option>
                {fixerLocation && <option value="nearest">{content["browse_sort_nearest"]}</option>}
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="text-primary font-medium hover:underline"
            >
              {content["browse_clear_filters"]}
            </button>
          </div>
        </div>

        {/* View Toggle and Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {isLoading
              ? content["browse_loading"]
              : content["browse_results_count"].replace("{n}", total.toString())}
          </p>

          {/* List/Map Toggle */}
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <List className="w-4 h-4" />
              {content["browse_view_list"]}
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                viewMode === "map"
                  ? "bg-primary text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Map className="w-4 h-4" />
              {content["browse_view_map"]}
            </button>
          </div>
        </div>

        {/* Results - List or Map View */}
        {viewMode === "map" ? (
          isLoading ? (
            <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <span className="text-gray-400">{content["browse_map_loading"]}</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapPinOff className="w-8 h-8 text-gray-400" />
              </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {content["browse_map_empty"]}
                </h3>
                <p className="text-gray-600">
                  {content["browse_map_empty_desc"]}
                </p>
              </div>
            </div>
          ) : (
            <MapView requests={requests} userType={session?.user?.userType} />
          )
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <SearchX className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {content["browse_empty_title"]}
              </h3>
              <p className="text-gray-600 mb-6">
                {content["browse_empty_desc"]}
              </p>
              <a
                href="/post"
                className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                {content["browse_empty_cta"]}
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {content["browse_prev"]}
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            page === pageNum
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span key={pageNum} className="text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {content["browse_next"]}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
