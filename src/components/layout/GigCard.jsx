"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Star,
  Clock,
  Heart,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  BarChart3,
} from "lucide-react";

const GigCard = ({ gig, showOwnerActions = false, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(gig.id);
    } catch (error) {
      console.error("Error deleting gig:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // console.log("Freelancer Dashboard userGigs", gig);

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow duration-300 relative">
      <div className="relative">
        <Link href={`/gig/${gig.id}`}>
          <img
            src={gig.images[0]}
            alt={gig.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </Link>

        {showOwnerActions && (
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/gig/${gig.id}`} className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Gig
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/freelancer/update-gig/${gig.id}`}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Gig
                  </Link>
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="flex items-center text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Gig
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Gig</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{gig.title}"? This
                        action cannot be undone and will remove all associated
                        orders and messages.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleting ? "Deleting..." : "Delete Gig"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {!showOwnerActions && (
          <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={gig.freelancer.avatar}
              alt={gig.freelancer.name}
            />
            <AvatarFallback>{gig.freelancer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {gig.freelancer.name}
            </p>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {gig.freelancer.rating}
              </span>
            </div>
          </div>
        </div>

        <Link href={`/gig/${gig.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
            {gig.title}
          </h3>
        </Link>

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
            <span className="text-sm font-medium">{gig.rating}</span>
            <span className="text-xs text-gray-600">
              ({gig.gigReviews.length})
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Starting at</p>
            <p className="text-lg font-bold text-gray-900">
              ₹{gig.packages[0].price}
            </p>
          </div>
        </div>

        {showOwnerActions && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-gray-600">Orders</p>
                <p className="text-sm font-semibold">{gig.gigReviews.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="text-sm font-semibold">
                  ₹
                  {gig?.gigReviews?.reduce((total, review) => {
                    return total + (review.order?.totalAmount || 0);
                  }, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GigCard;
