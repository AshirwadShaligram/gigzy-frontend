"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Plus,
  Clock,
  Tag,
  Save,
  ArrowLeft,
  IndianRupee,
} from "lucide-react";
import api from "@/axios/axiosInstance";
import { toast } from "sonner";

export default function UpdateGigPage() {
  const params = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [gig, setGig] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [gigData, setGigData] = useState({
    title: "",
    category: "",
    description: "",
    tags: [],
    price: "",
    deliveryTime: "",
    images: [],
    packages: [
      {
        name: "Basic",
        description: "Standard service package",
        price: "",
        deliveryTime: "",
        features: [
          "Basic features included",
          "Quality assurance",
          "1 revision round",
        ],
      },
      {
        name: "Standard",
        description: "Enhanced service package",
        price: "",
        deliveryTime: "",
        features: [
          "Everything in Basic",
          "Additional features",
          "Priority support",
          "3 revision rounds",
        ],
      },
      {
        name: "Premium",
        description: "Complete service solution",
        price: "",
        deliveryTime: "",
        features: [
          "Everything in Standard",
          "All premium features",
          "Unlimited revisions",
          "Extended warranty",
        ],
      },
    ],
  });

  const [newTag, setNewTag] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    if (!user.isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user.user?.role !== "freelancer") {
      router.push("/client/dashboard");
      return;
    }
  }, [user.isAuthenticated, user.user?.role, router]);

  // Fetch gig data
  useEffect(() => {
    const fetchGigData = async () => {
      if (
        !params.id ||
        !user.isAuthenticated ||
        user.user?.role !== "freelancer"
      ) {
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response = await api.get(`/gig/${params.id}`);

        let fetchedGig;

        if (response.data.gig) {
          fetchedGig = response.data.gig;
        } else if (response.data) {
          fetchedGig = response.data;
        } else {
          throw new Error("Invalid response structure");
        }

        const userId = String(user.user?.id);
        const freelancerId = String(fetchedGig.freelancer?.id);

        if (freelancerId !== userId) {
          setError("You don't have permission to edit this gig");
          router.push("/freelancer/dashboard");
          return;
        }

        setGig(fetchedGig);

        // Update form data with fetched gig data
        setGigData({
          title: fetchedGig.title || "",
          category: fetchedGig.category || "",
          description: fetchedGig.description || "",
          tags: fetchedGig.tags || [],
          price: fetchedGig.price?.toString() || "",
          deliveryTime: fetchedGig.deliveryTime?.toString() || "",
          images: fetchedGig.images || [],
          packages:
            fetchedGig.packages?.length > 0
              ? fetchedGig.packages.map((pkg) => ({
                  ...pkg,
                  price: pkg.price?.toString() || "",
                  deliveryTime: pkg.deliveryTime?.toString() || "",
                  features: pkg.features || [],
                }))
              : [
                  {
                    name: "Basic",
                    description: "Standard service package",
                    price: fetchedGig.price?.toString() || "",
                    deliveryTime: fetchedGig.deliveryTime?.toString() || "",
                    features: [
                      "Basic features included",
                      `${fetchedGig.deliveryTime || 7} day delivery`,
                      "Quality assurance",
                      "1 revision round",
                    ],
                  },
                  {
                    name: "Standard",
                    description: "Enhanced service package",
                    price: Math.round(
                      (fetchedGig.price || 100) * 1.5
                    ).toString(),
                    deliveryTime: (
                      (fetchedGig.deliveryTime || 7) + 3
                    ).toString(),
                    features: [
                      "Everything in Basic",
                      "Additional features",
                      "Priority support",
                      "3 revision rounds",
                    ],
                  },
                  {
                    name: "Premium",
                    description: "Complete service solution",
                    price: ((fetchedGig.price || 100) * 2).toString(),
                    deliveryTime: (
                      (fetchedGig.deliveryTime || 7) + 7
                    ).toString(),
                    features: [
                      "Everything in Standard",
                      "All premium features",
                      "Unlimited revisions",
                      "Extended warranty",
                    ],
                  },
                ],
        });

        setDataLoaded(true);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load gig data");
        router.push("/freelancer/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigData();
  }, [params.id, user.isAuthenticated, user.user?.id, user.user?.role, router]);

  if (!user.isAuthenticated || user.user?.role !== "freelancer") {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading gig data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => router.push("/freelancer/dashboard")}>
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Gig not found
  if (!gig && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Gig not found</p>
            <Button onClick={() => router.push("/freelancer/dashboard")}>
              Go Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

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

  const addTag = () => {
    if (
      newTag.trim() &&
      !gigData.tags.includes(newTag.trim()) &&
      gigData.tags.length < 5
    ) {
      setGigData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setGigData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addFeature = (packageIndex) => {
    if (newFeature.trim()) {
      setGigData((prev) => ({
        ...prev,
        packages: prev.packages.map((pkg, index) =>
          index === packageIndex
            ? { ...pkg, features: [...(pkg.features || []), newFeature.trim()] }
            : pkg
        ),
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (packageIndex, featureToRemove) => {
    setGigData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, index) =>
        index === packageIndex
          ? {
              ...pkg,
              features: (pkg.features || []).filter(
                (feature) => feature !== featureToRemove
              ),
            }
          : pkg
      ),
    }));
  };

  const updatePackage = (packageIndex, field, value) => {
    setGigData((prev) => ({
      ...prev,
      packages: prev.packages.map((pkg, index) =>
        index === packageIndex ? { ...pkg, [field]: value } : pkg
      ),
    }));
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = gigData.images.length + newImages.length;
    const remainingSlots = 5 - currentImageCount;

    if (remainingSlots <= 0) {
      setError("Maximum 5 images allowed");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    try {
      const base64Images = await Promise.all(
        filesToProcess.map((file) => fileToBase64(file))
      );

      setNewImages((prev) => [...prev, ...base64Images]);
      setError("");
    } catch (err) {
      setError("Failed to process images");
    }
  };

  const removeExistingImage = (imageUrl) => {
    setGigData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== imageUrl),
    }));
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!gigData.title || !gigData.description || !gigData.category) {
        throw new Error("Please fill in all required fields");
      }

      // Validate packages
      const validPackages = gigData.packages.filter(
        (pkg) => pkg.price && pkg.deliveryTime && pkg.description
      );

      if (validPackages.length === 0) {
        throw new Error("At least one package must be complete");
      }

      const updateData = {
        title: gigData.title,
        description: gigData.description,
        category: gigData.category,
        tags: gigData.tags,
        packages: validPackages.map((pkg) => ({
          ...pkg,
          price: parseFloat(pkg.price),
          deliveryTime: parseInt(pkg.deliveryTime),
        })),
      };

      if (imagesToDelete.length > 0) {
        updateData.imagesToDelete = imagesToDelete;
      }

      if (newImages.length > 0) {
        updateData.images = newImages;
      }

      const response = await api.put(`/gig/${params.id}`, updateData);

      toast.success("Gig updated successfully!");
      router.push("/freelancer/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update gig"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Update Gig</h1>
              <p className="text-gray-600">Make changes to your existing gig</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-lg font-semibold">
                  Gig Title *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Create a title that clearly describes what you're offering
                </p>
                <Input
                  id="title"
                  placeholder="I will create a modern responsive website"
                  value={gigData.title}
                  onChange={(e) =>
                    setGigData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="text-lg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {gigData.title.length}/80 characters
                </p>
              </div>

              <div>
                <Label className="text-lg font-semibold">Category *</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Choose the category that best fits your service
                </p>
                <Select
                  value={gigData.category}
                  onValueChange={(value) =>
                    setGigData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-lg font-semibold">
                  Description *
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Describe your service in detail. What will you deliver?
                </p>
                <Textarea
                  id="description"
                  placeholder="Describe your service, what's included, your experience, and why clients should choose you..."
                  value={gigData.description}
                  onChange={(e) =>
                    setGigData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={6}
                />
              </div>

              <div>
                <Label className="text-lg font-semibold">Tags</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Add up to 5 tags to help buyers find your gig
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {gigData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="relative group"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {gigData.tags.length < 5 && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="max-w-xs"
                    />
                    <Button onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Packages *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gigData.packages.map((pkg, index) => (
                  <Card
                    key={index}
                    className={`${index === 1 ? "ring-2 ring-purple-500" : ""}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {pkg.name}
                        {index === 1 && <Badge>Most Popular</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Package Description *</Label>
                        <Textarea
                          placeholder="Describe what's included in this package"
                          value={pkg.description}
                          onChange={(e) =>
                            updatePackage(index, "description", e.target.value)
                          }
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="flex items-center gap-1">
                            <IndianRupee className="h-4 w-4" />
                            Price *
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={pkg.price}
                            onChange={(e) =>
                              updatePackage(index, "price", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Delivery (days) *
                          </Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={pkg.deliveryTime}
                            onChange={(e) =>
                              updatePackage(
                                index,
                                "deliveryTime",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Features</Label>
                        <div className="space-y-2 mb-2">
                          {(pkg.features || []).map((feature, featureIndex) => (
                            <div
                              key={`${index}-${featureIndex}`}
                              className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                              <span className="text-sm">{feature}</span>
                              <button
                                onClick={() => removeFeature(index, feature)}
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add feature"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && addFeature(index)
                            }
                            className="text-sm"
                          />
                          <Button
                            onClick={() => addFeature(index)}
                            size="sm"
                            variant="outline"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Gig Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {/* Existing images */}
                {gigData.images.map((image, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={image}
                      alt={`Gig image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeExistingImage(image)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* New images */}
                {newImages.map((image, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={image}
                      alt={`New gig image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Upload button */}
                {gigData.images.length + newImages.length < 5 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload Image</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Image Guidelines
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use high-quality images (minimum 550x370 pixels)</li>
                  <li>• Show examples of your work or service process</li>
                  <li>• First image will be used as the main thumbnail</li>
                  <li>• Avoid text-heavy images</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Gig
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
