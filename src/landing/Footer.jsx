import { Facebook, GraduationCap, Instagram, Mail, Phone } from "lucide-react";
import React from "react";
import { BsWhatsapp } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import MrBoshta from "../assets/Mr-Boshta-removebg.png";
import { motion } from "framer-motion";
import { pageVariants, itemVariants } from "../motion";

const Footer = () => {
  const navigate = useNavigate();

  const socialLinks = [
    {
      Icon: Facebook,
      href: "https://www.facebook.com/omar.abdelaziz.606384/",
      label: "Facebook",
    },
    {
      Icon: Instagram,
      href: "https://www.instagram.com/eng.omarabdelaziz1?igsh=aXNreWg1ajZtaWw5&utm_source=qr",
      label: "Instagram",
    },
    {
      Icon: BsWhatsapp,
      href: "https://wa.me/201098161179",
      label: "WhatsApp",
    },
    {
      Icon: Mail,
      href: "mailto:alnfly.com@gmail.com",
      label: "Email",
    },
  ];

  return (
    <motion.footer variants={pageVariants} initial="hidden" animate="show" className="w-full bg-gray-300 py-12 px-4 sm:px-6">
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-[#1a5d1a] text-xl font-mekalbaz flex items-center gap-2">
            أ / محمد بشتة
            <img className="w-20 h-20" src={MrBoshta} />
          </h3>
          <span className="text-[#1a5d1a] text-sm">
            منصة التعلم الذكي المتكاملة
          </span>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {socialLinks.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#94a3b8] hover:text-[#1a5d1a] transition-colors duration-300"
              title={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
