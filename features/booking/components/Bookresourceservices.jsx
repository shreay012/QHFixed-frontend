"use client";

import { useEffect, useMemo, useState } from "react";
import ServiceCardGridV3 from "./ServiceCardGridV3";
import CardPrimary from "@/components/ui/CardPrimary";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store/hooks";
import { fetchAllServices } from "@/lib/redux/slices/discoverSlice/discoverserviceSlice";
import { getServiceIcon } from "@/lib/utils/serviceIcon";
import { useCmsTranslate } from "@/lib/i18n/useCmsTranslate";

// Card background palette (cycles for visual variety)
const BG_PALETTE = [
  "#135773",
  "#264746",
  "#471373",
  "#137351",
  "#855107",
  "#734913",
  "#BF9222",
  "#791E46",
];

const PAGE_SIZE = 8;

const Bookresourceservices = () => {
  const tBookExperts = useTranslations("bookExperts");
  const tCommon = useTranslations("common");
  const tCms = useCmsTranslate();
  const dispatch = useAppDispatch();
  const { allServices, isLoading } = useAppSelector((s) => s.services || {});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    dispatch(fetchAllServices());
  }, [dispatch]);

  const services = useMemo(
    () => (Array.isArray(allServices) ? allServices : []),
    [allServices],
  );

  const categories = useMemo(() => {
    const set = new Set();
    services.forEach((s) => s?.category && set.add(s.category));
    return ["All", ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [services, selectedCategory]);

  const decorated = useMemo(
    () =>
      filtered.map((svc, idx) => ({
        ...svc,
        backgroundColor: BG_PALETTE[idx % BG_PALETTE.length],
        // Prefer admin-uploaded image (service.imageUrl) over the hardcoded
        // category-icon mapping. Falls back to category icon when admin has
        // not set a custom image.
        iconName: svc.imageUrl || svc.image || getServiceIcon(svc),
      })),
    [filtered],
  );

  const visibleList = decorated.slice(0, visible);

  return (
    <section className="w-full bg-[#F2F9F1] py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
          <div className="flex items-start gap-6">
            <div className="w-[8px] h-[80px] bg-[#78EB54] rounded-none shrink-0" />
            <div className="flex flex-col gap-2">
              <h2 className="text-[40px] md:text-[48px] font-bold leading-tight text-[#404040] font-['Open_Sauce_One_Bold']">
                {tBookExperts("title")}
              </h2>
              <p className="text-[18px] md:text-[22px] text-[#636363] font-['Open_Sauce_One_Regular']">
                {tBookExperts("subtitle")}
              </p>
            </div>
          </div>

          {/* Custom Dropdown */}
          <div className="relative mt-4 md:mt-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-[#F5F5F5] border border-[#E0E0E0] px-6 py-3 rounded-xl text-[#666666] font-medium hover:bg-gray-100 transition-all min-w-[180px] justify-between shadow-sm"
            >
              <span>{selectedCategory}</span>
              <svg
                className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-full bg-white border border-[#E0E0E0] rounded-xl shadow-xl z-50 overflow-hidden max-h-[320px] overflow-y-auto">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setSelectedCategory(item);
                      setIsDropdownOpen(false);
                      setVisible(PAGE_SIZE);
                    }}
                    className={`w-full text-left px-6 py-3 hover:bg-green-50 hover:text-[#45A735] transition-colors border-b last:border-none border-[#F0F0F0] ${
                      item === selectedCategory ? "text-[#45A735] font-semibold" : "text-[#666666]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Loading / Empty states */}
        {isLoading && services.length === 0 && (
          <div className="text-center py-20 text-[#636363]">Loading services…</div>
        )}
        {!isLoading && services.length === 0 && (
          <div className="text-center py-20 text-[#636363]">{tBookExperts("noServices")}</div>
        )}

        {/* Big Cards Grid V3 */}
        {visibleList.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-20">
            {visibleList.map((service) => (
              <ServiceCardGridV3
                key={service._id}
                service={service}
                backgroundColor={service.backgroundColor}
                iconUrl={service.iconName}
              />
            ))}
          </div>
        )}

        {/* Divider */}
        {visibleList.length > 0 && <div className="h-[1px] bg-gray-200 w-full mb-20" />}

        {/* Small White Cards Grid */}
        {visibleList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16">
            {visibleList.map((service) => (
              <CardPrimary key={`p-${service._id}`} card={service} />
            ))}
          </div>
        )}

        {/* Load More */}
        {visible < decorated.length && (
          <div className="flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="bg-[#45A735] text-white px-12 py-4 rounded-xl font-bold text-[18px] hover:bg-[#3d942d] transition-all shadow-md active:scale-95"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Bookresourceservices;
