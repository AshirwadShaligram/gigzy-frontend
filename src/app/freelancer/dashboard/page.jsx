"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Calendar,
  Check,
  X,
  Loader2,
  Plus,
  Briefcase,
  Clock,
  CheckCircle,
  IndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import GigCard from "@/components/layout/GigCard";
import Navbar from "@/components/layout/Navbar";
import api from "@/axios/axiosInstance";

const FreelancerDashboard = () => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("gigs");
  const [userGigs, setUserGigs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    inProgress: 0,
    completed: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchFreelancerData();
    }
  }, [user]);

  const fetchFreelancerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch gigs
      const gigsResponse = await api.get(`/gig/user/${user.id}`);
      setUserGigs(gigsResponse.data);

      // Fetch orders and stats
      const ordersResponse = await api.get("/orders/my-orders");
      const freelancerOrders = ordersResponse.data.orders.filter(
        (order) => order.freelancerId === user.id
      );

      setOrders(freelancerOrders);

      // Calculate stats
      const newStats = {
        totalProjects: freelancerOrders.length,
        inProgress: freelancerOrders.filter((o) => o.status === "in_progress")
          .length,
        completed: freelancerOrders.filter((o) => o.status === "completed")
          .length,
        totalEarnings: freelancerOrders
          .filter((o) => o.status === "completed")
          .reduce((sum, order) => sum + order.totalAmount, 0),
      };

      setStats(newStats);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGig = async (gigId) => {
    try {
      await api.delete(`/gig/${gigId}`);
      setUserGigs(userGigs?.gigs.filter((gig) => gig.id !== gigId));
      toast.success("Gig successfully deleted.");
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast.error("Failed to delete gig");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchFreelancerData();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
        <Button onClick={fetchFreelancerData} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Freelancer Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                </div>
                <Briefcase className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-bold">
                    ₹{stats.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <IndianRupee className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Gig Button */}
        <div className="mb-6">
          <Button onClick={() => router.push("/freelancer/create-gig")}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Gig
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gigs">My Gigs</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="gigs">
            <Card>
              <CardHeader>
                <CardTitle>Your Gigs</CardTitle>
              </CardHeader>
              <CardContent>
                {userGigs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      You haven't created any gigs yet.
                    </p>
                    <Button
                      onClick={() => router.push("/create-gig")}
                      className="mt-4"
                    >
                      Create your first gig
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userGigs?.gigs?.map((gig) => (
                      <GigCard
                        key={gig.id}
                        gig={gig}
                        showOwnerActions={true}
                        onDelete={handleDeleteGig}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-gray-500">
                    You don't have any orders yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{order.gig.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
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
                            <div className="text-sm text-gray-600 mt-1">
                              Client: {order.client.name}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {order.status === "pending" && (
                              <Button
                                onClick={() =>
                                  handleUpdateOrderStatus(
                                    order.id,
                                    "in_progress"
                                  )
                                }
                                size="sm"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Accept Order
                              </Button>
                            )}
                            {order.status === "in_progress" && (
                              <Button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "delivered")
                                }
                                size="sm"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Mark as Delivered
                              </Button>
                            )}
                            {(order.status === "pending" ||
                              order.status === "in_progress") && (
                              <Button
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "cancelled")
                                }
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancel Order
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
        </Tabs>
      </div>
    </>
  );
};

export default FreelancerDashboard;
