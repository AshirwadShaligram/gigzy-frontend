"use client";

import FeaturedGigs from "@/components/layout/FeaturedGigs";
import Hero from "@/components/layout/Hero";
import Navbar from "@/components/layout/Navbar";
import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  const user = useSelector((state) => state.auth);
  console.log("HomePage User check:", user);

  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedGigs />
    </div>
  );
};

export default Home;
