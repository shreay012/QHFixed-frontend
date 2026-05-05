"use client";
import Image from "next/image";
import Button from "@mui/material/Button";
import { useTranslations } from "next-intl";

const Mainbanner = () => {
  const t = useTranslations("bookBanner");
  const handleScrollToServices = () => {
    const section = document.getElementById("book-experts-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <>
      <style>
        {`
          @keyframes floatUpDown {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          .animate-float {
            animation: floatUpDown 3s ease-in-out infinite;
          }
        `}
      </style>
      <div
        className="flex flex-col md:flex-row items-center justify-center md:gap-8 px-6 md:px-20 py-12 md:py-16 min-h-[500px] md:min-h-[600px] relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/images/resource-services/book-resource-bg.png)`,
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute bg-white/90 backdrop-blur-sm"></div>

        {/* Right side image - Shows first on mobile, second on desktop */}
        <div className="relative z-10 w-full md:w-auto flex justify-center md:justify-end order-1 md:order-2 mb-6 md:mb-0">
          <img
            src="/images/resource-services/book-resource-img.png"
            alt="Resource Team"
            className="max-w-full h-auto md:max-w-2xl animate-float"
          />
        </div>

        <div className="max-w-3xl z-10 relative order-2 md:order-1 text-center md:text-left">
          <h1 className="text-[32px] lg:text-[55px] font-[800] mb-6 leading-tight text-[#484848] select-auto font-['Open_Sauce_One_ExtraBold']">
            {t("titleLine1")}
            <br />
            <span className="text-[#45A735]">{t("titleHighlight")}</span> {t("titleEnd")}
          </h1>
          <p className="text-[18px] md:text-lg text-gray-600 mb-8 max-w-xl mx-auto md:mx-0 font-['Open_Sauce_One_Regular'] font-normal leading-[160%]">
            {t("subtitle")}
          </p>
          <div className="flex justify-center md:justify-start">
            <Button
              onClick={handleScrollToServices}
              variant="contained"
              className="rounded-xl px-[24px]! py-[18px]!"
              sx={{
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#45A735",
                textTransform: "none",
                fontFamily: "'Open Sauce One Regular'",
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0px",
                textAlign: "center",
                borderRadius: "8px",
                boxShadow: "none",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#26472B",
                  transition: "left 0.5s ease",
                  zIndex: 0,
                },
                "&:hover": {
                  boxShadow: "0px 14px 34px 0px #78EB5473",
                },
                "&:hover::before": {
                  left: 0,
                },
              }}
            >
              <span style={{ position: "relative", zIndex: 1 }}>
                {t("cta")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Mainbanner;
