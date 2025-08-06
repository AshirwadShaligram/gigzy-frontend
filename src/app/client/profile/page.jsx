"use client";

import Navbar from "@/components/layout/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Edit,
  MapPin,
  MessageCircle,
  Save,
  Star,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/axios/axiosInstance";
import { toast } from "sonner";
import { updateUserProfile } from "@/redux/slice/authSlice";

const ClientProfile = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
  });
  const [newAvatar, setNewAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  console.log("ClientProfile: order Details-", orders);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please select an image file");
      return;
    }

    try {
      const base64Image = await fileToBase64(file);
      setNewAvatar(base64Image);
      setError("");
    } catch (err) {
      setError("Failed to process image");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError("");

    try {
      const updateData = {
        name: profileData.name,
        bio: profileData.bio,
        skills: profileData.skills,
      };

      if (newAvatar) {
        updateData.avatar = newAvatar;
      }

      const resultAction = await dispatch(updateUserProfile(updateData));

      if (updateUserProfile.fulfilled.match(resultAction)) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setNewAvatar(null);
      } else {
        console.error("Update failed:", resultAction.error);
        setError(resultAction.error?.message || "Update failed");
      }
    } catch (err) {
      console.error("Error during update:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for client orders
  const clientOrders = [
    {
      id: "1",
      gigTitle: "Modern E-commerce Website Development",
      gigImage:
        "https://images.pexels.com/photos/326502/pexels-photo-326502.jpeg",
      freelancerName: "John Doe",
      freelancerAvatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      status: "in_progress",
      totalAmount: 599,
      orderDate: "2024-01-15",
      deliveryDate: "2024-01-25",
      requirements:
        "I need a modern e-commerce website with payment integration.",
    },
    {
      id: "2",
      gigTitle: "Professional Logo Design Package",
      gigImage:
        "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
      freelancerName: "Sarah Wilson",
      freelancerAvatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      status: "delivered",
      totalAmount: 89,
      orderDate: "2024-01-10",
      deliveryDate: "2024-01-13",
      requirements: "Create a professional logo for my tech startup.",
    },
  ];

  const getOrderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage
                    src={newAvatar || user?.avatar}
                    alt={profileData.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {profileData.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerFileInput}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Change Photo
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="text-2xl font-bold mb-2"
                      />
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-900">
                        {profileData.name}
                      </h1>
                    )}
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {user?.location || "Location not specified"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Member since {user?.memberSince || "2023"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          size="sm"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            setNewAvatar(null);
                            setProfileData({
                              name: user?.name || "",
                              bio: user?.bio || "",
                            });
                          }}
                          size="sm"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  {isEditing ? (
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-700">
                      {profileData.bio || user?.bio || "No bio yet"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-6">
              {orders?.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={order.gig.images[0]}
                          alt={order.gig.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold text-lg">
                            {order.gig.title}
                          </h4>
                          <p className="text-gray-600">
                            by {order.freelancer.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={getOrderStatusColor(order.status)}
                            >
                              {order.status.replace("_", " ")}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Ordered on{" "}
                              {new Date(order.createdAt).toDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{order.totalAmount}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(order.deliveryDate).toDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="font-semibold">Requirements:</Label>
                      <p className="text-gray-700 mt-1">{order.requirements}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={order.freelancer.avatar}
                            alt={order.freelancer.name}
                          />
                          <AvatarFallback>
                            {order.freelancer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {order.freelancer.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        {order.status === "delivered" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email} disabled />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="Add phone number" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Email notifications</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Order updates</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Marketing emails</span>
                      <input type="checkbox" />
                    </div>
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientProfile;
