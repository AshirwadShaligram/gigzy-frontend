"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, SlidersHorizontal, Grid, List } from "lucide-react";
import api from "@/axios/axiosInstance";

const AllGigPage = () => {
  const searchParams = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedDeliveryTime, setSelectedDeliveryTime] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Web Development",
    "Mobile Development",
    "Graphic Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming",
    "Business Services",
    "Data Science",
  ];

  const deliveryOptions = [
    { value: "1", label: "1 day" },
    { value: "3", label: "3 days" },
    { value: "7", label: "1 week" },
    { value: "14", label: "2 weeks" },
    { value: "30", label: "1 month" },
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest First" },
  ];

  useEffect(() => {
    const fetchGigs = async () => {
      setIsLoading(true);
      try {
        // Build query parameters properly
        const params = new URLSearchParams();

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }

        if (priceRange[0] > 0) {
          params.append("minPrice", priceRange[0].toString());
        }

        if (priceRange[1] < 1000) {
          params.append("maxPrice", priceRange[1].toString());
        }

        if (selectedDeliveryTime !== "all") {
          params.append("maxDeliveryTime", selectedDeliveryTime);
        }

        if (minRating > 0) {
          params.append("minRating", minRating.toString());
        }

        if (sortBy !== "relevance") {
          params.append("sortBy", sortBy);
        }

        const queryString = params.toString();
        const url = `/gig${queryString ? `?${queryString}` : ""}`;

        const response = await api.get(url);

        const data = response.data;

        if (data && data.gigs) {
          setGigs(data.gigs);
        } else {
          console.warn("⚠️ No gigs property in response:", data);
          setGigs([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch gigs:", error);
        console.error("📊 Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
        });
        setGigs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, [
    searchQuery,
    selectedCategory,
    priceRange,
    selectedDeliveryTime,
    minRating,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
    setSelectedDeliveryTime("all");
    setMinRating(0);
    setSortBy("relevance");
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "all" ? selectedCategory : null,
    priceRange[0] > 0 || priceRange[1] < 1000 ? "price" : null,
    selectedDeliveryTime !== "all" ? selectedDeliveryTime : null,
    minRating > 0 ? "rating" : null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Browse Services
          </h1>
          <p className="text-gray-600">
            Discover amazing services from talented freelancers
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-80 space-y-6`}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">
                    Category
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">
                    Price Range: ₹{priceRange[0]} - {priceRange[1]}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    min={0}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹1000+</span>
                  </div>
                </div>

                {/* Delivery Time Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">
                    Delivery Time
                  </Label>
                  <Select
                    value={selectedDeliveryTime}
                    onValueChange={setSelectedDeliveryTime}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      {deliveryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          Up to {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Filter */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">
                    Minimum Rating:{" "}
                    {minRating > 0 ? `${minRating}+ stars` : "Any"}
                  </Label>
                  <Slider
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Any</span>
                    <span>5 stars</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading
                    ? "Loading..."
                    : `${gigs.length} services available`}
                </h2>
                {searchQuery && (
                  <p className="text-gray-600 mt-1">
                    Results for "{searchQuery}"
                  </p>
                )}
              </div>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                    <button onClick={() => setPriceRange([0, 1000])}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedDeliveryTime !== "all" && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Up to{" "}
                    {
                      deliveryOptions.find(
                        (opt) => opt.value === selectedDeliveryTime
                      )?.label
                    }
                    <button onClick={() => setSelectedDeliveryTime("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {minRating}+ stars
                    <button onClick={() => setMinRating(0)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Gigs Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : gigs.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {gigs.map((gig) => (
                  <Link key={gig.id} href={`/gig/${gig.id}`} className="group">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                      {gig.images?.[0] && (
                        <div className="relative h-48 w-full">
                          <img
                            src={gig.images[0]}
                            alt={gig.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          {gig.freelancer?.avatar && (
                            <div className="relative w-8 h-8 mr-2">
                              <img
                                src={gig.freelancer.avatar}
                                alt={gig.freelancer.name}
                                className="rounded-full object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <span className="text-sm font-medium">
                            {gig.freelancer?.name || "Unknown"}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                          {gig.title}
                        </h3>
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500">★</span>
                          <span className="ml-1 text-sm">
                            {gig.rating || "New"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold">
                            From ₹
                            {gig.packages?.[0]?.price || gig.price || "N/A"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {gig.packages?.[0]?.deliveryTime ||
                              gig.deliveryTime ||
                              "N/A"}{" "}
                            day(s)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms to find what you're
                  looking for.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllGigPage;
