"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-white/10 hover:bg-white/20 text-text-primary hover:text-white border border-white/20 hover:border-white/30 rounded-full p-2 md:p-3 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl backdrop-blur-sm cursor-pointer"
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
    </button>
  );
};
