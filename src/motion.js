// Shared framer-motion presets used across the app.
// Keep animations subtle & fast so the UI stays snappy on mobile.

export const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

export const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const cardHover = {
  whileHover: { y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } },
  whileTap: { scale: 0.985 },
};

export const modalBackdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalPanel = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.15 } },
};
