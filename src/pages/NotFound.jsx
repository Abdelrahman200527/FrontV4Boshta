import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MoveLeft, Home, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = 1.5 + Math.random() * 1.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(26, 93, 26, 0.25)";
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(26, 93, 26, ${0.08 * (1 - dist / CONNECTION_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Framer Motion Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 12 },
    },
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-[#f5f9f2] via-white to-[#e8f0e4] flex items-center justify-center p-6 font-sans">
      {/* --- Canvas Background --- */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* --- Main Content --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center items-center gap-2 mb-6"
        >
          <img className="w-16 h-16" src={MrBoshta} alt="Mr. Boshta" />
          <span className="text-xl font-bold text-[#1a5d1a]">
            أ / محمد بشتة
          </span>
        </motion.div>

        {/* 404 Number with float */}
        <motion.div
          variants={floatVariants}
          initial="initial"
          animate="animate"
          className="relative mb-2"
        >
          <h1 className="text-[120px] sm:text-[160px] md:text-[200px] font-extrabold leading-none tracking-tight text-[#1a5d1a] select-none">
            404
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1a5d1a]/80 tracking-widest uppercase mb-4"
        >
          الصفحة غير موجودة
        </motion.p>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-[#1a5d1a]/60 text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-10"
        >
          عذراً، الصفحة التي تبحث عنها قد تكون تمت إزالتها أو تغيير اسمها أو أنها غير متاحة حالياً.
        </motion.p>

        {/* Animated button group */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(26, 93, 26, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-3.5 rounded-xl bg-[#1a5d1a] text-white font-medium text-sm tracking-wide shadow-lg shadow-[#1a5d1a]/20 hover:shadow-[#1a5d1a]/40 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Home size={18} />
              <span>العودة للرئيسية</span>
            </span>
            <span className="absolute inset-0 w-full h-full bg-[#2a7d2a] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.button>

          <motion.button
            onClick={() => navigate("/contact")}
            whileHover={{ scale: 1.05, color: "#1a5d1a" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3.5 rounded-xl border border-[#1a5d1a]/20 text-[#1a5d1a]/60 font-medium text-sm tracking-wide hover:border-[#1a5d1a]/50 transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <HelpCircle size={18} />
            <span>تواصل مع الدعم</span>
          </motion.button>
        </motion.div>

        {/* Decorative floating elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[#FFA900]/10 blur-2xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#1a5d1a]/5 blur-3xl"
        />
      </motion.div>
    </div>
  );
};

export default NotFound;