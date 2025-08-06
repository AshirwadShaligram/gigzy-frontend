"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  LogOut,
  Menu,
  MessageCircle,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSelector } from "react-redux";
import { useLogout } from "@/lib/useLogout";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const logoutUser = useLogout();

  return (
    <nav className="bg-white w-full shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-lg font-bold text-gray-900">Gigzy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/gig"
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              Browser Services
            </Link>
            {isAuthenticated && user?.role === "freelancer" && (
              <Link
                href="/freelancer/dashboard"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === "client" && (
              <Link
                href="/client/dashboard"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link href="/messages">
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/order">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          user?.role === "freelancer"
                            ? "/freelancer/profile"
                            : "/client/profile"
                        }
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logoutUser}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Join now
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              <Link
                href="/browse"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Browse Service
              </Link>
              {isAuthenticated && user?.role === "freelancer" && (
                <Link
                  href="/dashboard/freelancer"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === "client" && (
                <Link
                  href="/dashboard/client"
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
