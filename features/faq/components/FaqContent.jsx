"use client";

import { useState } from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useCmsContent } from "@/lib/hooks/useCmsContent";
import { useTranslations } from "next-intl";

export default function FaqContent() {
  const t = useTranslations("faqPage");
  const { items: faqData } = useCmsContent("faqs", []);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [expandedItem, setExpandedItem] = useState("q1");

  const toggleCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    const firstItem = faqData.find((cat) => cat.id === categoryId)?.items[0];
    setExpandedItem(firstItem ? firstItem.id : null);
  };

  const toggleItem = (itemId) => {
    setExpandedItem((prev) => (prev === itemId ? null : itemId));
  };

  const currentCategory = faqData.find((cat) => cat.id === selectedCategory);
  const currentFaqItems = currentCategory?.items.length
    ? currentCategory.items
    : faqData
        .flatMap((c) => c.items)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-[34px] font-bold text-gray-900">
            {t("sectionTitle")}
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-1 lg:gap-12">
          {/* Categories Sidebar - Desktop */}
          <div className="hidden lg:block lg:w-1/4">
            <h3
              className="text-xl font-bold mb-6"
              style={{
                color: "var(--text-primary)",
                fontSize: "var(--font-size-22)",
              }}
            >
              {t("categories")}
            </h3>
            <div className="space-y-3">
              {faqData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className="w-full text-left  pl-0  px-4 py-0 rounded-lg transition-colors duration-200 flex items-center focus:outline-none"
                  style={{
                    cursor: "pointer",
                    fontWeight: selectedCategory === category.id ? 600 : 400,
                    color:
                      selectedCategory === category.id
                        ? "var(--quickhire-green-light-second)"
                        : "var(--text-secondary)",
                  }}
                >
                  <div
                    className={`w-1 h-5 rounded-full mr-3 transition-colors duration-200 ${selectedCategory === category.id ? "bg-green-600" : "bg-transparent"}`}
                  />
                  <span className="flex-1 text-base font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories Chips - Mobile */}
          <div className="lg:hidden mb-8">
            <div className="flex overflow-x-auto space-x-3 pb-4">
              {faqData.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus:outline-none ${
                    selectedCategory === category.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="lg:w-3/4">
            <div className="space-y-2">
              {currentFaqItems.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-gray-200 last:border-b-0"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-4 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <h4
                      className="flex-1 leading-none tracking-normal pr-4 transition-colors duration-200"
                      style={{
                        fontSize: "var(--font-size-16)",
                        fontWeight: "var(--font-weight-700)",
                        color:
                          expandedItem === item.id
                            ? "var(--dark-text-primary)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {item.question}
                    </h4>
                    <div className="shrink-0 text-gray-500">
                      {expandedItem === item.id ? <RemoveIcon /> : <AddIcon />}
                    </div>
                  </button>

                  {expandedItem === item.id && (
                    <div className="px-4 pb-5">
                      <p
                        style={{
                          fontFamily: "'Open Sauce One Regular', sans-serif",
                          fontSize: "var(--font-size-16)",
                          fontWeight: "var(--font-weight-400)",
                          lineHeight: "160%",
                          letterSpacing: "0%",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
