import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/redux/Providers";

export const metadata = {
  title: "Gigzy - Freelancing Platform",
  description: "Connect with top freelancers and clients",
};

const inter = Inter({ subsets: ["latin"], weight: "400" });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
