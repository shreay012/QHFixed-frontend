"use client";

import { useState, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import { ButtonPrimaryhowitwork } from "@/components/ui";
import { useTranslations } from "next-intl";
import { useSiteVideo } from "@/lib/hooks/useSiteVideo";
import SmartVideo from "@/components/ui/SmartVideo";
import { isEmbedded } from "@/lib/utils/videoUrl";

export default function HowQuickHireWorks({ hideVideo }) {
  const t = useTranslations("homepage.howItWorks");
  const tCommon = useTranslations("common");
  const videoUrl = useSiteVideo("how-we-hire");
  const embedded = isEmbedded(videoUrl);

  const steps = [
    { number: 1, title: t("step1Title"), description: t("step1Desc") },
    { number: 2, title: t("step2Title"), description: t("step2Desc") },
    { number: 3, title: t("step3Title"), description: t("step3Desc") },
    { number: 4, title: t("step4Title"), description: t("step4Desc") },
    { number: 5, title: t("step5Title"), description: t("step5Desc") },
  ];
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for autoplay
  const videoRef = useRef(null);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        // Unmute when user manually plays
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleUnmute = (e) => {
    e.stopPropagation(); // Prevent triggering togglePlayPause
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <section
      // className="py-16 px-4 bg-cover bg-center bg-no-repeat"
      className="py-10 md:py-16 px-4 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/images/aboutusbg.png)",
        // backgroundColor: '#26472B',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="text-center mb-12 "> */}
        <div className="text-center mb-3 md:mb-12">
          <h2 className="font-bold text-(--bg-primary) leading-[150%] tracking-[0px] capitalize text-2xl md:text-[44px]">
            {t("title")}{" "}
            <span style={{ color: "var(--quickhire-green)" }}>{t("titleHighlight")}</span>
          </h2>
        </div>

        {/* Steps Grid */}
        {/* <div className="relative mt-12 pt-12 pb-10"> */}
        <div className="relative mt-2 md:mt-12 pt-4 md:pt-12 pb-10">
          {/* Mobile: Vertical Layout with Dotted Lines */}
          <div className="md:hidden flex flex-col">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <Box
                  className="rounded-2xl p-6"
                  sx={{
                    backgroundColor: "#396340",
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#78EB54" }}
                    >
                      <span className="text-black font-bold text-lg">
                        {step.number}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                        style={{ fontSize: "20px" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-gray-300 font-normal leading-normal"
                        style={{ fontSize: "14px" }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Box>

                {/* Vertical Dotted Line - Only show if not last step */}
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center gap-1 py-4">
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                    <div className="w-0.5 h-2 bg-white opacity-60"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop: Original Layout */}
          <div className="hidden md:block relative">
            {/* First Row - 3 Steps */}
            <div className="grid grid-cols-3 gap-14 mb-16 relative">
              {steps.slice(0, 3).map((step, index) => (
                <Box
                  key={step.number}
                  className="rounded-2xl p-6 relative"
                  sx={{
                    backgroundColor: "#396340",
                  }}
                >
                  {index < 2 && (
                    <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 flex gap-1 z-10">
                      <div className="w-2.5 h-0.5 bg-white"></div>
                      <div className="w-2.5 h-0.5 bg-white"></div>
                      <div className="w-2.5 h-0.5 bg-white"></div>
                    </div>
                  )}
                  {/* Vertical connector from card 3 */}
                  {index === 2 && (
                    <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 flex flex-col gap-1 items-center z-10">
                      <div className="w-0.5 h-3 bg-white"></div>
                      <div className="w-0.5 h-3 bg-white"></div>
                      <div className="w-0.5 h-3 bg-white"></div>
                      <div className="w-0.5 h-3 bg-white"></div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#78EB54" }}
                    >
                      <span className="text-black font-bold text-sm">
                        {step.number}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                        style={{ fontSize: "24px" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-gray-300 font-normal leading-normal"
                        style={{ fontSize: "16px" }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </Box>
              ))}
            </div>

            {/* Second Row - 2 Steps (cards 5 and 4) */}
            <div className="grid grid-cols-2 gap-14 relative">
              <Box
                key={steps[4].number}
                className="rounded-2xl p-6 relative"
                sx={{
                  backgroundColor: "#396340",
                }}
              >
                <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 flex gap-1 z-10">
                  <div className="w-2.5 h-0.5 bg-white"></div>
                  <div className="w-2.5 h-0.5 bg-white"></div>
                  <div className="w-2.5 h-0.5 bg-white"></div>
                </div>
                <div className="flex items-start gap-3">
                  {/* Number Badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#78EB54" }}
                  >
                    <span className="text-black font-bold text-sm">
                      {steps[4].number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                      style={{ fontSize: "24px" }}
                    >
                      {steps[4].title}
                    </h3>
                    <p
                      className="text-gray-300 font-normal leading-normal"
                      style={{ fontSize: "16px" }}
                    >
                      {steps[4].description}
                    </p>
                  </div>
                </div>
              </Box>
              <Box
                key={steps[3].number}
                className="rounded-2xl p-6 relative"
                sx={{
                  backgroundColor: "#396340",
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Number Badge */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#78EB54" }}
                  >
                    <span className="text-black font-bold text-sm">
                      {steps[3].number}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-white font-bold mb-2 leading-[100%] tracking-[0%]"
                      style={{ fontSize: "24px" }}
                    >
                      {steps[3].title}
                    </h3>
                    <p
                      className="text-gray-300 font-normal leading-normal"
                      style={{ fontSize: "16px" }}
                    >
                      {steps[3].description}
                    </p>
                  </div>
                </div>
              </Box>
            </div>
          </div>
        </div>

        {/* Video/Content Section - Only show if not hidden */}
        {!hideVideo && (
          <Box
            className="overflow-hidden mx-auto rounded-2xl sm:rounded-4xl md:rounded-[24px] mt-12"
            sx={{
              backgroundColor: "white",
              width: "100%",
              maxWidth: "1000px",
              aspectRatio: { xs: "16/9", md: "16/9" },
              position: "relative",
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <SmartVideo
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

            {/* Sound indicator - show when muted */}
            {isMuted && !embedded && (
              <div
                className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-black/80 transition-colors z-10"
                onClick={handleUnmute}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
                <span>{tCommon("clickToUnmute")}</span>
              </div>
            )}

            {/* Custom Play/Pause Button - Only show on hover, and only for
                native <video> (YouTube/Vimeo iframes have their own controls). */}
            {isHovering && !embedded && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <IconButton
                  onClick={togglePlayPause}
                  sx={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    color: "#26472B",
                    width: { xs: "60px", sm: "70px", md: "80px" },
                    height: { xs: "60px", sm: "70px", md: "80px" },
                    pointerEvents: "auto",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "scale(1.1)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {isPlaying ? (
                    <PauseIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />
                  ) : (
                    <PlayArrowIcon
                      sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }}
                    />
                  )}
                </IconButton>
              </div>
            )}
          </Box>
        )}
      </div>
    </section>
  );
}
