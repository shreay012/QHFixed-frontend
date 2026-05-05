'use client';

import { useState } from 'react';
import { CheckCircle } from '@mui/icons-material';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function BookResourceClient() {
  const t = useTranslations('homepage.bookResource');
  const [tabIndex, setTabIndex] = useState(0);

  const tabContent = [
    {
      video: "/videos/howWeHire.mp4",
      title: t("tab1Title"),
      desc: t("tab1Desc"),
      available: t("availableHours", { hours: t("tab1Available") }),
      engineers: [
        "Prompt Engineer",
        "Machine-Learning Developer",
        "Generative Developer",
        "Content Developer",
        "Agentic Developer",
        "Vision Engineer",
        "TensorFlow Developer",
      ],
    },
    {
      video: "/videos/howWeHire.mp4",
      title: t("tab2Title"),
      desc: t("tab2Desc"),
      available: t("availableHours", { hours: t("tab2Available") }),
      engineers: [
        "Frontend Developer",
        "Backend Developer",
        "Fullstack Developer",
        "Mobile Developer",
        "DevOps Engineer",
      ],
    },
    {
      video: "/videos/howWeHire.mp4",
      title: t("tab3Title"),
      desc: t("tab3Desc"),
      available: t("availableHours", { hours: t("tab3Available") }),
      engineers: [
        "UI Designer",
        "UX Designer",
        "Graphic Designer",
        "Product Designer",
      ],
    },
  ];

  const currentTab = tabContent[tabIndex];

  return (
    <div className="min-h-screen w-full px-4 py-12 md:px-16 bg-[#f5f7f5]">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <h2 className="text-[36px] font-bold text-center mb-3 tracking-[0px] leading-[150%] capitalize text-[#404040] font-['Open_Sauce_One_ExtraBold']">
          {t("title")}
        </h2>
        <p className="text-center mb-10 text-[20px] font-normal leading-[150%] tracking-[0px] capitalize text-[#636363] font-['Open_Sauce_One_Regular']">
          {t("subtitle")}
        </p>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 items-start">
          {/* Left Card - Expert Profile */}
          <div className="rounded-2xl p-6 shadow-xl flex flex-col md:flex-row gap-6 bg-[#26472B]">
            <div className="rounded-xl overflow-hidden relative shrink-0 w-full md:w-70">
              <video
                src={currentTab.video}
                autoPlay
                loop
                muted
                className="w-full object-cover h-[358px]"
              />
              {/* Availability badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white rounded-full px-3 py-1.5 shadow-lg">
                <CheckCircle className="text-green-600" fontSize="small" />
                <span className="text-xs font-medium text-gray-800">{currentTab.available}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-white text-2xl font-bold mb-3 leading-[150%] tracking-normal capitalize font-['Open_Sauce_One_Bold']">
                {currentTab.title}
              </h3>
              <p className="text-white text-[15px] font-normal leading-[150%] tracking-normal capitalize font-['Open_Sauce_One_Regular']">
                {currentTab.desc}
              </p>
            </div>
          </div>

          {/* Right Section - Engineer Options */}
          <div className="flex flex-col justify-center rounded-2xl">
            <h4 className="text-2xl font-bold mb-2 leading-[150%] tracking-normal capitalize text-[#484848] font-['Open_Sauce_One_Bold']">
              {t("curatedTitle")}
            </h4>
            <p className="mb-8 text-base leading-[150%] tracking-normal capitalize text-[#636363] font-['Open_Sauce_One_Medium'] font-medium">
              {t("curatedSubtitle")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentTab.engineers.map((eng) => (
                <button
                  key={eng}
                  className="group bg-white hover:bg-gray-50 rounded-[60px] pt-3 pr-6 pb-3 pl-6 font-['Open_Sauce_One_Regular'] font-normal text-[18px] leading-[100%] tracking-normal text-[#484848] text-left flex items-center justify-between transition-all"
                >
                  <span>{eng}</span>
                  <Image
                    src="/images/resource-services/book-resource-arrow.svg"
                    alt="arrow"
                    width={30}
                    height={30}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
