"use client";

import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/axios/axiosInstance";
import { Clock, IndianRupee, Plus, Tag, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const CreateGig = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [fileInputRef, setFileInputRef] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        description: "",
        price: "",
        deliveryTime: "",
        features: [],
      },
      {
        name: "Standard",
        description: "",
        price: "",
        deliveryTime: "",
        features: [],
      },
      {
        name: "Premium",
        description: "",
        price: "",
        deliveryTime: "",
        features: [],
      },
    ],
  });

  const [newTag, setNewTag] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [activePackage, setActivePackage] = useState(0);

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
    "Game Design",
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
            ? { ...pkg, features: [...pkg.features, newFeature.trim()] }
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
              features: pkg.features.filter(
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return gigData.title && gigData.category && gigData.description;
      case 2:
        return gigData.packages.some(
          (pkg) => pkg.price && pkg.deliveryTime && pkg.description
        );
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...gigData,

        price: parseFloat(gigData.price) || 0,
        deliveryTime: parseInt(gigData.deliveryTime) || 0,

        packages: gigData.packages
          .filter((pkg) => pkg.price && pkg.deliveryTime && pkg.description)
          .map((pkg) => ({
            ...pkg,
            price: parseFloat(pkg.price),
            deliveryTime: parseInt(pkg.deliveryTime),
            features: pkg.features || [],
          })),
      };

      const response = await api.post("/gig/", submitData);

      toast.success("Gig created successfully!");

      router.push("/freelancer/dashboard");
    } catch (error) {
      if (error.response?.data?.error) {
        toast.error(` ${error.response.data.error}`);
      } else {
        toast.error("Failed to create gig. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/get-profile");
      } catch (e) {
        router.push("/login");
      }
    };
    checkAuth();
  }, []);

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Title, category, and description",
    },
    {
      number: 2,
      title: "Pricing",
      description: "Set your packages and pricing",
    },
    {
      number: 3,
      title: "Gallery",
      description: "Add images to showcase your work",
    },
    { number: 4, title: "Publish", description: "Review and publish your gig" },
  ];

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setGigData((prev) => ({
          ...prev,
          images: [...prev.images, e.target.result],
        }));
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields before proceeding");
      return;
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create a New Gig
          </h1>
          <p className="text-gray-600">
            Share your skills with the world and start earning
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.number}
                </div>
                <div className="ml-3">
                  <p
                    className={`font-medium ${
                      currentStep >= step.number
                        ? "text-purple-600"
                        : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-purple-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6 mb-10">
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
                    maxLength={80}
                    required
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
                    required
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
                  <Label
                    htmlFor="description"
                    className="text-lg font-semibold"
                  >
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
                    required
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
              </div>
            )}

            {/* Step 2: Pricing */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Package Pricing</h2>
                  <p className="text-gray-600 mb-6">
                    Offer different service levels to attract more buyers. At
                    least one package must be complete.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {gigData.packages.map((pkg, index) => (
                    <Card
                      key={index}
                      className={`${
                        index === 1 ? "ring-2 ring-purple-500" : ""
                      }`}
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
                              updatePackage(
                                index,
                                "description",
                                e.target.value
                              )
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
                              min="1"
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
                              min="1"
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
                            {pkg.features.map((feature) => (
                              <div
                                key={feature}
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
              </div>
            )}

            {/* Step 3: Gallery */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Gig Gallery</h2>
                  <p className="text-gray-600 mb-6">
                    Add images to showcase your work and attract more buyers
                    (Optional)
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gigData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Gig image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          setGigData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index),
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {gigData.images.length < 5 && (
                    <>
                      <input
                        type="file"
                        ref={(ref) => setFileInputRef(ref)}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        style={{ display: "none" }}
                      />
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors"
                        onClick={() => fileInputRef?.click()}
                      >
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Upload Image</p>
                          <p className="text-xs text-gray-500">
                            Click to browse files
                          </p>
                        </div>
                      </div>
                    </>
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
              </div>
            )}

            {/* Step 4: Publish */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Review Your Gig</h2>
                  <p className="text-gray-600 mb-6">
                    Review all the details before publishing your gig
                  </p>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="font-semibold">Title:</Label>
                          <p>{gigData.title}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Category:</Label>
                          <p>{gigData.category}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Description:</Label>
                          <p className="text-sm text-gray-700">
                            {gigData.description}
                          </p>
                        </div>
                        <div>
                          <Label className="font-semibold">Tags:</Label>
                          <div className="flex gap-2 mt-1">
                            {gigData.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pricing Packages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {gigData.packages
                          .filter(
                            (pkg) =>
                              pkg.price && pkg.deliveryTime && pkg.description
                          )
                          .map((pkg, index) => (
                            <div key={index} className="border rounded-lg p-4">
                              <h4 className="font-semibold">{pkg.name}</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {pkg.description}
                              </p>
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-lg">
                                  ₹{pkg.price}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {pkg.deliveryTime} days
                                </span>
                              </div>
                              <div className="space-y-1">
                                {pkg.features.map((feature) => (
                                  <p key={feature} className="text-sm">
                                    ✓ {feature}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {gigData.images.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Gallery</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {gigData.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Gig image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || isSubmitting}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={!validateStep(currentStep)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={
                    isSubmitting || !validateStep(1) || !validateStep(2)
                  }
                >
                  {isSubmitting ? "Publishing..." : "Publish Gig"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateGig;
