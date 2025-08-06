"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Upload,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUserProfile } from "@/redux/slice/authSlice";

const FreelancerProfile = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills || [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        skills: user.skills || [],
        hourlyRate: user.hourlyRate || "$25",
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

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
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
                        <Calendar className="h-4 w-4" />
                        <span>
                          Member since{" "}
                          {new Date(user?.memberSince).getFullYear()}
                        </span>
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
                              skills: user?.skills || [],
                              hourlyRate: user?.hourlyRate || "$25",
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

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{user?.rating}</span>
                    <span className="text-gray-600">
                      ({user?.completedProjects} reviews)
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {user?.completedProjects} projects completed
                  </Badge>
                </div>

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

                {/* Skills */}
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profileData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="relative group"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        className="max-w-xs"
                      />
                      <Button onClick={addSkill} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {user?.reviewsReceived.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {review.client.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {review.client.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {review.gig.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
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
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt).toDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
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

export default FreelancerProfile;
