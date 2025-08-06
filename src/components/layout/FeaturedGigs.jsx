"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Clock, Heart, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import api from "@/axios/axiosInstance";
import { toast } from "sonner";
import Link from "next/link";

const FeaturedGigs = () => {
  const [gigs, setGigs] = useState();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/gig/");
        setGigs(response.data);
      } catch (error) {
        console.error("Error fetching gigs:", error);
        toast.error("Failed to load the GIGs!");
      }
    }
    fetchData();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover top-rated services from our most talented freelancers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gigs?.gigs?.map((gig) => (
            <Card
              key={gig.id}
              className="group cursor-pointer hover:shadow-lg transition-shadow duration-300"
            >
              <Link href={`/gig/${gig.id}`}>
                <div className="relative">
                  <img
                    src={gig.images[0]}
                    alt={gig.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={gig.freelancer.avatar || ""}
                        alt={gig.freelancer.name}
                      />
                      <AvatarFallback>
                        {gig.freelancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {gig.freelancer.name}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">
                          {gig.freelancer.rating || "New"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {gig.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {gig.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      {gig.packages[0].deliveryTime} days
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {gig.rating || "0.0"}
                      </span>
                      <span className="text-xs text-gray-600">
                        ({gig.reviews || "0"})
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Starting at</p>
                      <p className="text-lg font-bold text-gray-900">
                        ₹{gig.packages[0].price}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedGigs;
