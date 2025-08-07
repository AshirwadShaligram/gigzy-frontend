"use client";

import FeaturedGigs from "@/components/layout/FeaturedGigs";
import Hero from "@/components/layout/Hero";
import Navbar from "@/components/layout/Navbar";
import React from "react";
import { useSelector } from "react-redux";

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <FeaturedGigs />
    </div>
  );
};

export default Home;
