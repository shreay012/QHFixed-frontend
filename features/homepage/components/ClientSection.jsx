"use client";

import { useState, useEffect, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCmsContent } from "@/lib/hooks/useCmsContent";
import { useCmsTranslate } from "@/lib/i18n/useCmsTranslate";

const ClientSection = () => {
  const t = useTranslations("spotlights");
  const tCms = useCmsTranslate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState("next");
  const intervalRef = useRef(null);

  const { items: testimonials } = useCmsContent("testimonials", []);

  // Auto-advance carousel
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setDirection("next");
        setCurrentSlide((prev) =>
          prev === testimonials.length - 1 ? 0 : prev + 1,
        );
      }, 3000); // Change slide every 3 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, testimonials.length]);

  const handlePrev = () => {
    setDirection("prev");
    setCurrentSlide((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
    // Reset timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleNext = () => {
    setDirection("next");
    setCurrentSlide((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1,
    );
    // Reset timer when manually navigating
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeftDesktop {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) translateX(0);
          }
        }

        .animate-slide-in {
          animation: slideInLeft 0.5s ease-out;
        }

        @media (min-width: 1024px) {
          .animate-slide-in {
            animation: slideInLeftDesktop 0.5s ease-out;
          }
        }
      `}</style>

      <section className="py-12 px-4 sm:py-16 bg-white relative">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
            {/* Left Section - Title and Navigation */}
            <div className="lg:w-1/2 flex flex-col justify-start w-full">
              <div className="mb-6 sm:mb-8">
                {/* <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                  Quickhire Success <br />
                  <span className="italic font-normal">Spotlights</span>
                </h2> */}
                <h2 className="text-center sm:text-left text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                  {t("titleLine1")} <br />
                  <span className="font-bold sm:font-normal text-[#45A735] sm:text-gray-900 sm:italic">
                    {t("titleHighlight")}
                  </span>
                </h2>
                <p className="text-center sm:text-left text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              {/* Navigation Arrows */}
              {/* <div className="flex gap-3 sm:gap-4 mt-6 lg:mt-40"> */}
              <div className="hidden lg:flex gap-3 sm:gap-4 mt-6 lg:mt-40">
                {/* <IconButton
                  onClick={handlePrev}
                  sx={{
                    backgroundColor: "#E5E5E5",
                    width: { xs: "48px", sm: "56px" },
                    height: { xs: "48px", sm: "56px" },
                    "&:hover": {
                      backgroundColor: "#D5D5D5",
                    },
                  }}
                >
                  <ArrowBackIcon
                    sx={{ color: "#000", fontSize: { xs: "20px", sm: "24px" } }}
                  />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#E5E5E5",
                    width: { xs: "48px", sm: "56px" },
                    height: { xs: "48px", sm: "56px" },
                    "&:hover": {
                      backgroundColor: "#D5D5D5",
                    },
                  }}
                >
                  <ArrowForwardIcon
                    sx={{ color: "#000", fontSize: { xs: "20px", sm: "24px" } }}
                  />
                </IconButton> */}
                <IconButton
                  onClick={handlePrev}
                  sx={{
                    backgroundColor: "#E5E5E5",
                    width: { xs: "48px", sm: "66px" },
                    height: { xs: "48px", sm: "66px" },
                    boxShadow: "none",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "0%",
                      backgroundColor: "#78EB54",
                      transition: "height 0.6s ease",
                      zIndex: 0,
                    },
                    "&:hover::before": {
                      height: "100%",
                    },
                    "& .MuiSvgIcon-root": {
                      position: "relative",
                      zIndex: 1,
                      transition: "color 0.3s ease",
                    },
                    "&:hover .MuiSvgIcon-root": {
                      color: "#FFFFFF",
                    },
                  }}
                >
                  <ArrowBackIcon
                    sx={{ color: "#000", fontSize: { xs: "20px", sm: "24px" } }}
                  />
                </IconButton>
                <IconButton
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#E5E5E5",
                    width: { xs: "48px", sm: "66px" },
                    height: { xs: "48px", sm: "66px" },
                    boxShadow: "none",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "0%",
                      backgroundColor: "#78EB54",
                      transition: "height 0.6s ease",
                      zIndex: 0,
                    },
                    "&:hover::before": {
                      height: "100%",
                    },
                    "& .MuiSvgIcon-root": {
                      position: "relative",
                      zIndex: 1,
                      transition: "color 0.3s ease",
                    },
                    "&:hover .MuiSvgIcon-root": {
                      color: "#FFFFFF",
                    },
                  }}
                >
                  <ArrowForwardIcon
                    sx={{ color: "#000", fontSize: { xs: "20px", sm: "24px" } }}
                  />
                </IconButton>
              </div>
            </div>

            {/* Right Section - Video with Overlay Card */}
            <div className="lg:w-1/2 w-full hidden lg:block">
              <div
                className="relative rounded-2xl w-full overflow-hidden"
                style={{ maxWidth: "650px", aspectRatio: "650/407" }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Background Video */}
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source
                    src="/videos/howWeHire.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
            </div>
          </div>

          {/* Floating Content Card - Positioned Below Title */}
          <Box
            key={`card-${currentSlide}`}
            className="rounded-xl animate-slide-out"
            sx={{
              backgroundColor: "#EDFFEA",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "none",
              width: { xs: "calc(100% - 32px)", sm: "90%", md: "459px" },
              maxWidth: "459px",
              // minWidth: "309px",
              minHeight: { xs: "auto", sm: "218px" },
              zIndex: 3,
              padding: { xs: "16px", sm: "20px", md: "24px" },
              display: "flex",
              flexDirection: "column",
              position: { xs: "relative", lg: "absolute" },
              top: { xs: "auto", lg: "65%" },
              bottom: { xs: "auto", lg: "auto" },
              left: { xs: "auto", lg: "40%" },
              transform: { xs: "none", lg: "translate(-50%, -50%)" },
              margin: { xs: "24px auto 0", lg: "0" },
            }}
          >
            <div className="mb-3 sm:mb-4">
              <Image
                src={testimonials[currentSlide].logo}
                alt={testimonials[currentSlide].company}
                width={62.5}
                height={26}
                className="object-contain"
                style={{ maxHeight: "24px", width: "auto" }}
              />
            </div>

            {/* Description */}
            <p className="text-gray-800 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 font-medium">
              {tCms(testimonials[currentSlide].description)}
            </p>

            {/* Role - if available */}
            <p className="text-gray-600 text-xs italic mt-auto text-right">
              {tCms(testimonials[currentSlide].role)}
            </p>
          </Box>
        </div>
      </section>
    </>
  );
};

export default ClientSection;
