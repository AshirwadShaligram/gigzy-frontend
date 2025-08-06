"use client";

import api from "@/axios/axiosInstance";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Check, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const ClientDashboard = () => {
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });

  const user = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user.isAuthenticated) {
      router.push("/login");
    } else {
      fetchOrders();
      fetchReviews();
    }
  }, [user.isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/my-orders");
      const data = await response.data;
      if (data) {
        setOrders(data.orders);
      } else {
        setError(data.error || "Failed to fetch orders");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get("/reviews/my-reviews");
      const data = response.data;
      if (data) {
        setReviews(data.reviews);
      } else {
        setError(data.error || "Failed to fetch My-reviews");
      }
    } catch (error) {
      setError("failed to fetch reviews:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "delivered":
        return <Badge className="bg-purple-500">Delivered</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCompleteOrder = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });

      if (response.error) {
        toast.error(response.error);
      } else {
        fetchOrders();
        toast.success("Order completed");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;

    const postReviewData = {
      orderId: selectedOrder.id,
      rating: reviewData.rating,
      comment: reviewData.comment,
    };

    try {
      const response = await api.post("/reviews", postReviewData);

      if (response) {
        toast.success("Review posted successfully.");
        setSelectedOrder(null);
        setReviewData({ rating: 5, comment: "" });
        fetchOrders();
        fetchReviews();
      } else {
        toast.error(response.error || "Failed to submit review");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (!user.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Client Dashboard
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-gray-500">
                    You haven't placed any orders yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{order.gig.title}</h3>
                            <div className="flex items-center text-sm text-gray-600">
                              {getStatusBadge(order.status)}
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                Due:{" "}
                                {new Date(
                                  order.deliveryDate
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-gray-700 mt-2">
                              {order.requirements}
                            </p>
                            <p className="font-semibold mt-2">
                              ₹{order.totalAmount}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center mb-2">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>
                                {order.freelancer.rating?.toFixed(1) || "New"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Freelancer: {order.freelancer.name}
                            </div>
                            {order.status === "delivered" && (
                              <Button
                                onClick={() =>
                                  handleCompleteOrder(order.id, "completed")
                                }
                                className="mt-2"
                                size="sm"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark as complete
                              </Button>
                            )}
                            {order.status === "completed" && !order.review && (
                              <Button
                                onClick={() => setSelectedOrder(order)}
                                className="mt-2"
                                size="sm"
                                variant="outline"
                              >
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>My Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">
                    You haven't submitted any reviews yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {review.gig.title}
                            </h3>
                            <div className="flex items-center mt-1">
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
                            <p className="text-gray-700 mt-2">
                              {review.comment}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600">
                            Freelancer: {review.freelancer.name}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Write Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedOrder.gig.title}</h3>
                    <p className="text-sm text-gray-600">
                      Freelancer: {selectedOrder.freelancer.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rating
                    </label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() =>
                            setReviewData({ ...reviewData, rating: star })
                          }
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium mb-1"
                    >
                      Review
                    </label>
                    <Textarea
                      id="comment"
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          comment: e.target.value,
                        })
                      }
                      placeholder="Share your experience..."
                      rows={4}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => setSelectedOrder(null)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
