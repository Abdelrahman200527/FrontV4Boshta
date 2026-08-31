import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import background from "../assets/background.png";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

export default function MainLayout() {
  return (
    <motion.div variants={pageVariants} initial="hidden" animate="show" className="flex h-screen overflow-hidden">
      <Sidebar />

      <motion.div variants={itemVariants} className="flex-1 min-w-0 flex flex-col pt-14 lg:pt-0 mt-7 lg:mt-0" style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        <main className="p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </motion.div>
    </motion.div>
  );
}
