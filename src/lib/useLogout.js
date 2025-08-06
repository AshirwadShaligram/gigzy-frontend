"use client";

import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutUser } from "@/redux/slice/authSlice";

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Logout failed, but you have been signed out locally");
      router.push("/login");
    }
  };

  return logout;
};
