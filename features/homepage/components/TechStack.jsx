"use client";

import { Button } from "@mui/material";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCmsContent } from "@/lib/hooks/useCmsContent";

export default function TechStack() {
  const t = useTranslations("techStack");
  const { items: technologies } = useCmsContent("technologies", []);
  const duplicatedTechnologies = [...technologies, ...technologies];

  return (
    <section
      className="py-12 px-4 sm:py-16 techstack"
      style={{ backgroundColor: "#F2F9F1" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
            {t("title")}
          </h2>

          <p className="text-gray-600 text-sm sm:text-base max-w-3xl mx-auto px-4">
            {t("subtitle")}
          </p>
        </div>

        {/* Technologies Marquee */}
        <div className="py-4 sm:py-12 overflow-hidden">
          <div className="relative">
            {/* Marquee Container */}
            <div className="flex animate-marquee">
              {duplicatedTechnologies.map((tech, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex flex-col items-center justify-center border mx-2 w-[100px] h-[103px] p-[12px] sm:w-[120px] sm:h-[123px] sm:p-[16px]"
                  style={{
                    borderRadius: "16px",
                    borderWidth: "1px",
                    background:
                      "linear-gradient(180deg, #FFFFFF 0%, #DEFFD4 100%)",
                    borderColor: "#E5E5E5",
                  }}
                >
                  <div className="mb-1.5 sm:mb-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    <Image
                      src={tech.img}
                      alt={tech.name}
                      width={48}
                      height={40}
                      className="object-contain sm:w-[58px] sm:h-[48px]"
                    />
                  </div>
                  <span className="text-base sm:text-xl font-semibold text-gray-700 text-center">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for marquee animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 20s linear infinite;
          width: fit-content;
          gap: 25px;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
