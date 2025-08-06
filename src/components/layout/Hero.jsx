"use client";

import { Search, Star, TrendingUp, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import api from "@/axios/axiosInstance";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Web Development",
    "Graphic Design",
    "Digital Marketing",
    "Writing & Translation",
    "Video & Animation",
    "Music & Audio",
    "Programming",
    "Business Services",
  ];

  const stats = [
    { icon: Users, value: "10K+", label: "Active Freelancers" },
    { icon: TrendingUp, value: "50K+", label: "Projects Completed" },
    { icon: Star, value: "4.9", label: "Average Rating" },
  ];

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSearchResults = async (query) => {
    setIsLoading(true);
    try {
      const response = await api.get(
        `/gig?search=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.data;
      setSearchResults(data.gigs || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/gig?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find the Perfect
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Freelancer
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto">
            Connect with skilled professionals worldwide. Get your projects done
            quickly and efficiently.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 relative">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-14 text-gray-900 bg-white"
                />
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-14 px-8"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-gray-700">Loading...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((gig) => (
                      <Link
                        key={gig.id}
                        href={`/gig/${gig.id}`}
                        className="block p-4 hover:bg-gray-100 text-gray-800 border-b border-gray-200"
                      >
                        <div className="font-medium">{gig.title}</div>
                        <div className="text-sm text-gray-600">
                          {gig.category}
                        </div>
                      </Link>
                    ))}
                    {searchResults.length >= 5 && (
                      <div className="p-4 text-center">
                        <Button
                          variant="link"
                          className="text-purple-600"
                          onClick={handleSearch}
                        >
                          View all results for "{searchQuery}"
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-gray-700">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div className="text-center" key={index}>
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-white/10 rounded-full">
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
