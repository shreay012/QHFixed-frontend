"use client";

import Image from "next/image";
import { useCmsContent } from "@/lib/hooks/useCmsContent";
import { useTranslations } from "next-intl";
import { useCmsTranslate } from "@/lib/i18n/useCmsTranslate";

function WhyQuickSection() {
  const { items } = useCmsContent("features", []);
  const t = useTranslations("homepage.whyQuick");
  const tCms = useCmsTranslate();
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2
            style={{
              color: "var(--text-primary)",
              fontWeight: "var(--font-weight-700)",
              fontSize: "clamp(26px, 5vw, 44px)",
            }}
          >
            {t("title")}{" "}
            <span style={{ color: "var( --quickhire-green)" }}>{t("highlight")}</span>
          </h2>
          <p
            className="mt-2 sm:mt-3"
            style={{
              color: "var( --text-muted)",
              fontWeight: "var(--font-weight-400)",
              fontSize: "clamp(16px, 3vw, 23px)",
            }}
          >
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-8 sm:mt-12 flex flex-col gap-8 lg:gap-10 lg:flex-row lg:items-start">
          <div className="relative hidden lg:flex w-full justify-center lg:w-1/2">
            <figure className="absolute -top-40">
              <Image
                width={350}
                height={400}
                src="/images/arrow-down.svg"
                alt="Arrow Down"
              />
            </figure>
          </div>

          <div className="hide-scrollbar flex w-full flex-col gap-6 sm:gap-8 lg:w-1/2 max-h-[600px] lg:max-h-[400px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.title} className="flex gap-3 sm:gap-4">
                <div className="mt-1 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center flex-shrink-0">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={24}
                    height={24}
                    className="sm:w-[40px] sm:h-[40px]"
                    style={{
                      filter:
                        "brightness(0) saturate(100%) invert(52%) sepia(73%) saturate(464%) hue-rotate(68deg) brightness(95%) contrast(87%)",
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-[14px] text-base sm:text-lg font-semibold text-slate-700">
                    {tCms(item.title)}
                  </h3>
                  <p
                    className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base"
                    style={{ color: "#909090" }}
                  >
                    {tCms(item.description)}
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-lime-600" />
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyQuickSection;
