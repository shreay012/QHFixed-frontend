"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";
import { useTranslations } from "next-intl";

const CarouselSection = () => {
  const t = useTranslations("carousel");

  const cards = [
    { title: t("card1Title"), description: t("card1Desc") },
    { title: t("card2Title"), description: t("card2Desc") },
    { title: t("card3Title"), description: t("card3Desc") },
    { title: t("card1Title"), description: t("card1Desc") },
    { title: t("card2Title"), description: t("card2Desc") },
    { title: t("card3Title"), description: t("card3Desc") },
  ];
  const trackRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const handleScroll = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    // const scrollAmount = track.clientWidth * 1.25;
    const scrollAmount = track.clientWidth * 1.25;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;

    if (direction === "next") {
      // If we're at the end, scroll back to start
      if (track.scrollLeft >= maxScrollLeft - 10) {
        track.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        track.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    } else {
      track.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling) return;

    const interval = setInterval(() => {
      handleScroll("next");
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling, handleScroll]);

  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

  const handleManualScroll = (direction) => {
    setIsAutoScrolling(false);
    handleScroll(direction);

    // Resume auto-scroll after 5 seconds
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 5000);
  };

  return (
    <section className="w-full" style={{ backgroundColor: "#F2F9F1" }}>
      <div className="flex w-full flex-col gap-8 pl-4 pr-0 py-8 sm:pl-6 sm:pr-0 sm:py-16 md:gap-10 md:py-20 lg:flex-row lg:items-start lg:gap-16 lg:pl-20 lg:pr-0">
        <div className="w-full max-w-[480px] space-y-4 md:space-y-8">
          <div className="flex items-center gap-3 sm:gap-6">
            <div
              className="hidden sm:block w-1.5 sm:w-2 rounded-full bg-[#78EB54]"
              style={{ height: "120px" }}
            />
            <div className="flex-1">
              <h2
                className="leading-tight text-center sm:text-left"
                style={{
                  color: "#404040",
                  fontWeight: 700,
                  fontSize: "clamp(24px, 5vw, 36px)",
                }}
              >
                {t("title")}
              </h2>
            </div>
          </div>
          <div>
            <p className="hidden sm:block text-base text-slate-600 sm:text-lg md:text-xl leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-3 sm:gap-4">
            <IconButton
              className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20  "
              sx={{
                backgroundColor: "#FFFFFF",
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
              onClick={() => handleManualScroll("prev")}
              aria-label="Scroll cards left"
            >
              <ArrowBackIcon
                sx={{ fontSize: { xs: 20, sm: 32 }, color: "#000000" }}
              />
            </IconButton>
            <IconButton
              className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20"
              sx={{
                backgroundColor: "#FFFFFF",
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
              onClick={() => handleManualScroll("next")}
              aria-label="Scroll cards right"
            >
              <ArrowForwardIcon
                sx={{ fontSize: { xs: 20, sm: 32 }, color: "#000000" }}
              />
            </IconButton>
          </div>
        </div>

        <div
          ref={trackRef}
          className="hide-scrollbar flex flex-1 gap-4 sm:gap-6 overflow-x-auto pb-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {cards.map((card, index) => (
            <div
              key={`${card.title}-${index}`}
              className="min-w-[270px] sm:min-w-[280px] md:min-w-[350px] min-h-[250px] sm:min-h-[330px] md:min-h-[360px] flex-1 rounded-2xl bg-white p-6 sm:p-8"
            >
              <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-[#78EB54]">
                <Image
                  src="/images/homepage/AI.svg"
                  alt="AI Icon"
                  width={28}
                  height={28}
                  className="sm:w-[32px] sm:h-[32px]"
                />
              </div>
              {/* <h3 className="text-l sm:text-xl font-bold text-slate-700">
               */}
              {/* <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700"> */}
              <h3 className="text-[16px] sm:text-xl md:text-2xl font-bold text-slate-700">
                {card.title}
              </h3>
              <p
                className="mt-2 sm:mt-3 text-[14px] sm:text-[16px] md:text-[20px]"
                style={{ color: "#909090" }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarouselSection;
