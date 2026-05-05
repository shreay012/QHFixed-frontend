"use client";

import { SectionWrapper } from "@/components/common";
import { useTranslations } from "next-intl";

export default function FaqHero() {
  const t = useTranslations("faqPage");
  return (
    <SectionWrapper
      background="green"
      className="relative overflow-hidden py-0"
      padding=""
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-linear-to-br from-[#26472B] to-[#1a3320] opacity-95" />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "url(/images/aboutusbg.png)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center p-[45px] md:py-20">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl lg:text-[60px] font-bold text-white leading-tight mb-4">
            {t("heroTitle")}
          </h1>
          <p className="text-[15px] md:text-2xl text-white/90 leading-relaxed max-w-2xl mt-0 md:mt-[30px] mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
}
