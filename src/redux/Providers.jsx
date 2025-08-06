"use client";

import { Provider } from "react-redux";
import store from "@/redux/store";
import AuthProvider from "@/components/layout/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          expand={false}
          duration={4000}
        />
      </AuthProvider>
    </Provider>
  );
}
