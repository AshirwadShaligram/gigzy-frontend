"use client";

import api from "@/axios/axiosInstance";
import MessageSidebar from "@/components/layout/MessageSidebar";
import Navbar from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Check,
  Clock,
  Heart,
  MessageCircle,
  Share2,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const GigPage = () => {
  const params = useParams();
  const router = useRouter();
  const [isMessageSidebarOpen, setIsMessageSidebarOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [gig, setGig] = useState();
  const user = useSelector((state) => state.auth);

  // console.log("User in gigPage:", user.user);
  // console.log("Gig packages in GigPage:", gig?.packages[0]);
  // console.log("Gigs in gigPage:", gig);

  useEffect(() => {
    const fetchGig = async () => {
      if (!params.id) {
        return;
      }

      try {
        const response = await api.get(`/gig/${params.id}`);

        let fetchedGig;

        if (response.data.gig) {
          fetchedGig = response.data.gig;
        } else if (response.data) {
          fetchedGig = response.data;
        } else {
          throw new Error("Invalid response structure");
        }

        setGig(fetchedGig);
      } catch (error) {}
    };
    fetchGig();
  }, [params.id, user.isAuthenticated, user.user?.id, router]);

  //   Find gig
  if (!gig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-2-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold">Gig not found</h1>
              <p className="mt-2">
                The gig you're looking for doesn't exist or has been removed
              </p>
              <Button className="mt-4" onClick={() => router.push("/")}>
                Browse other gig
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleOrder = async () => {
    if (!user?.isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.user.role !== "client") {
      toast.error("Only clients can place orders");
      return;
    }

    const selectedPackageIndex =
      Math.min(selectedPackage, gig?.packages.length - 1) || 0;
    const selectedPackageData = gig?.packages[selectedPackageIndex];

    const price = selectedPackageData?.price;
    const packageId = selectedPackageData?.id;
    const deliveryTime = selectedPackageData?.deliveryTime;

    const userData = {
      packageId,
      requirements,
      customDeliveryTime: deliveryTime,
      gigId: gig?.id,
      price,
    };
    let data;

    try {
      const response = await api.post("/orders", userData);
      data = response.data;
      if (data) {
        toast.success("Order created successfully.");
        setRequirements("");
      }
    } catch (error) {
      console.error("Creating order error:", error);
      const errorMessage =
        error.response?.data?.error || "Error creating an order";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={gig.images[0]}
                    alt={gig.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="secondary" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 p-4">
                  {gig.images.slice(0, 3).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gig Details */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{gig.category}</Badge>
                  <div className="flex items-center gap-1">
                    {gig.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {gig.title}
                </h1>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={gig.freelancer.avatar}
                        alt={gig.freelancer.name}
                      />
                      <AvatarFallback>
                        {gig.freelancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{gig.freelancer.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{gig.freelancer.rating}</span>
                        <span className="text-sm text-gray-600">
                          ({gig.gigReviews.length} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setIsMessageSidebarOpen(true)}
                    className="ml-auto"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>

                <div className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700">
                    {gig.description}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About the seller */}
            <Card>
              <CardHeader>
                <CardTitle>About the seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={gig.freelancer.avatar}
                      alt={gig.freelancer.name}
                    />
                    <AvatarFallback>
                      {gig.freelancer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {gig.freelancer.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Professional {gig.category.toLowerCase()} specialist
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="h-5 w-5 text-yellow-400" />
                        </div>
                        <p className="text-lg font-bold">
                          {gig.freelancer.rating}
                        </p>
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-lg font-bold">
                          {gig.gigReviews.length}
                        </p>
                        <p className="text-sm text-gray-600">Reviews</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-lg font-bold">
                          {new Date(gig.freelancer.memberSince).getFullYear()}
                        </p>
                        <p className="text-sm text-gray-600">Member</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Reviews
                  <Badge variant="secondary">{gig?.gigReviews.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {gig?.gigReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b pb-6 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage
                            src={review.client.avatar}
                            alt={review.client.name}
                          />
                          <AvatarFallback>
                            {review.client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">
                              {review.client.name}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pricing */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <Tabs
                  value={selectedPackage.toString()}
                  onValueChange={(value) => setSelectedPackage(parseInt(value))}
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="0">Basic</TabsTrigger>
                    <TabsTrigger value="1">Standard</TabsTrigger>
                    <TabsTrigger value="2">Premium</TabsTrigger>
                  </TabsList>

                  {gig?.packages.map((pkg, index) => (
                    <TabsContent
                      key={index}
                      value={index.toString()}
                      className="mt-4"
                    >
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold">₹{pkg.price}</h3>
                          <p className="text-gray-600">{pkg.description}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {pkg.deliveryTime} days delivery
                          </div>
                        </div>

                        <div className="space-y-2">
                          {pkg.features.map((feature, featureIndex) => (
                            <div
                              key={featureIndex}
                              className="flex items-center gap-2"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <Textarea
                            placeholder="Describe your requirements..."
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            rows={3}
                          />

                          <Button
                            onClick={handleOrder}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            size="lg"
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Continue (₹{pkg.price})
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Sidebar */}
      <MessageSidebar
        isOpen={isMessageSidebarOpen}
        onClose={() => setIsMessageSidebarOpen(false)}
        freelancer={{
          id: gig.freelancer.id,
          name: gig.freelancer.name,
          avatar: gig.freelancer.avatar,
          isOnline: true,
        }}
        gigTitle={gig.title}
      />
    </div>
  );
};

export default GigPage;
