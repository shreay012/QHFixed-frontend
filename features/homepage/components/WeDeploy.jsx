"use client";

import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

const WeDeploy = () => {
  const t = useTranslations("homepage.weDeploy");

  return (
    <section
      className="py-5 px-4 sm:py-12"
      style={{ backgroundColor: "#FFF7F1" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-3 sm:mb-12">
          <h2
            className="font-bold leading-[150%] sm:leading-[175%] tracking-[0px] capitalize text-2xl sm:text-3xl md:text-[36px] lg:text-[44px]"
            style={{ color: "#000000" }}
          >
            {t("title")}
            <br className="hidden sm:block" />
            {t("titleLine2")}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-8">
          {[1, 2, 3, 4].map((n) => (
            <Box
              key={n}
              className="p-4 sm:p-6 rounded-lg"
              sx={{ backgroundColor: "#FFF7F1", border: "1px" }}
            >
              <h3
                className="mb-1 sm:mb-3 text-lg sm:text-xl md:text-2xl"
                style={{ fontFamily: "Open Sauce One Medium, sans-serif", fontWeight: 500, lineHeight: "32px", color: "#000000" }}
              >
                {t(`feature${n}Title`)}
              </h3>
              <p
                className="leading-relaxed text-sm sm:text-base md:text-lg"
                style={{ color: "#636363", fontFamily: "Open Sauce One, sans-serif", fontWeight: 500, lineHeight: "150%", textTransform: "capitalize" }}
              >
                {t(`feature${n}Desc`)}
              </p>
              <Divider sx={{ marginTop: "16px", width: "100%", maxWidth: "570px", height: "1px", borderBottomWidth: "1px", borderColor: "#B4B4B4", backgroundColor: "#B4B4B4" }} />
            </Box>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WeDeploy;
