import React from "react";
import Header from "./Header";
import Hero from "./Hero";
import About from "./About";
import Roles from "./Roles";
import Footer from "./Footer";
import { motion } from "framer-motion";
import { pageVariants } from "../motion";

const LandingPage = () => {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="min-h-screen bg-white overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Roles />
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
