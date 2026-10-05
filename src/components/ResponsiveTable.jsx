/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const ResponsiveTable = ({
  children,
  minWidth = 800,
  maxHeight = "max-h-[70vh]",
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full overflow-x-auto overflow-y-auto custom-scrollbar touch-scroll overscroll-x-contain ${maxHeight} ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ minWidth: `${minWidth}px` }} className="w-full">
        {children}
      </div>
    </motion.div>
  );
};

export default ResponsiveTable;