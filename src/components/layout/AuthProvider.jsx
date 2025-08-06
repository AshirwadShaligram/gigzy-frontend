"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreAuthState } from "@/redux/slice/authSlice";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreAuthState());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
