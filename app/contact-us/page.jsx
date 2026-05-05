"use client";

import { useState } from "react";
import PhoneIcon from "@mui/icons-material/Phone";
import MailIcon from "@mui/icons-material/Mail";
import { useTranslations } from "next-intl";
import { miscellaneousService } from "@/lib/services/miscellaneousApi";

export default function ContactUs() {
  const t = useTranslations("contactUs");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    description: false,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    description: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const validateField = (name, value) => {
    if (name === "name" || name === "phone" || name === "description") {
      return value.trim() === "";
    }
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return value.trim() === "" || !emailRegex.test(value);
    }
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "description") {
      if (value.length <= maxChars) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setCharCount(value.length);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTouched = { name: true, email: true, phone: true, description: true };
    setTouched(newTouched);

    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      description: validateField("description", formData.description),
    };
    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error);
    if (hasErrors) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await miscellaneousService.contactUs(formData);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", phone: "", organization: "", description: "" });
      setCharCount(0);
      setTouched({ name: false, email: false, phone: false, description: false });
      setErrors({ name: false, email: false, phone: false, description: false });
    } catch (err) {
      setSubmitError(t("submitError") || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-[#F2F9F1] to-white pb-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-xl sm:text-2xl md:text-[26px] lg:text-[28px] font-bold text-[#000000] mb-4 pt-8">
              {t("title")}
            </h1>
            <p className="text-sm text-[#636363] max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-full mx-auto">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div
                className="bg-white p-8"
                style={{
                  border: "1px solid var(--Ui-Color-Secondary-Light, #D9E5E3)",
                  borderRadius: "16px",
                }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#000000] mb-2">
                      {t("nameLbl")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("namePlaceholder")}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                        touched.name && errors.name
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-[#45A735] focus:border-transparent"
                      }`}
                    />
                    {touched.name && errors.name && (
                      <p className="text-red-500 text-sm mt-1">{t("nameError")}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#000000] mb-2">
                      {t("emailLbl")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("emailPlaceholder")}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                        touched.email && errors.email
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-[#45A735] focus:border-transparent"
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-red-500 text-sm mt-1">{t("emailError")}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-[#000000] mb-2">
                      {t("phoneLbl")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("phonePlaceholder")}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${
                        touched.phone && errors.phone
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-[#45A735] focus:border-transparent"
                      }`}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{t("phoneError")}</p>
                    )}
                  </div>

                  {/* Organization */}
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-[#000000] mb-2">
                      {t("orgLbl")}{" "}
                      <span className="text-gray-400 text-xs">{t("orgOptional")}</span>
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder={t("orgPlaceholder")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#45A735] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-[#000000] mb-2">
                      {t("descLbl")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={t("descPlaceholder")}
                      required
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all resize-none ${
                        touched.description && errors.description
                          ? "border-red-500 focus:ring-2 focus:ring-red-500"
                          : "border-gray-300 focus:ring-2 focus:ring-[#45A735] focus:border-transparent"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {touched.description && errors.description && (
                        <p className="text-red-500 text-sm">{t("descError")}</p>
                      )}
                      <div
                        className={`text-sm text-[#636363] ${touched.description && errors.description ? "" : "ml-auto"}`}
                      >
                        {charCount}/{maxChars}
                      </div>
                    </div>
                  </div>

                  {submitSuccess && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm font-medium">
                      {t("successMsg")}
                    </div>
                  )}
                  {submitError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
                      {submitError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(180deg, #45A735 0%, #1B4115 100%)" }}
                  >
                    {isSubmitting ? t("submitting") : t("submit")}
                  </button>
                </form>
              </div>
            </div>

            {/* Get In Touch */}
            <div className="lg:col-span-1">
              <div
                className="bg-white p-8"
                style={{
                  border: "1px solid var(--Ui-Color-Secondary-Light, #D9E5E3)",
                  borderRadius: "16px",
                }}
              >
                <h2 className="text-2xl font-bold text-[#000000] mb-4">
                  {t("getInTouch")}
                </h2>
                <p className="text-[#636363] mb-8">
                  {t("getInTouchDesc")}
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#45A735] rounded-lg flex items-center justify-center">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1B4115] mb-1 text-sm">
                        {t("phoneLabel")}
                      </h3>
                      <a
                        href="tel:+919870289050"
                        className="text-[#000] font-semibold text-sm hover:text-[#45A735] transition-colors"
                      >
                        +91 98702 89050
                      </a>
                      <p className="text-sm text-[#636363] mt-1">
                        {t("phoneHours")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#45A735] rounded-lg flex items-center justify-center">
                      <MailIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1B4115] mb-1 text-sm">
                        {t("emailLabel")}
                      </h3>
                      <a
                        href="mailto:info@quickhire.services"
                        className="text-[#000000] break-all hover:text-[#45A735] transition-colors"
                      >
                        info@quickhire.services
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
