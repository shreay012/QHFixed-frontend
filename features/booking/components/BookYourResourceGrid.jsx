"use client";

import { useEffect } from "react";
import React from "react";
import { useTranslations } from "next-intl";
import CardPrimary from "@/components/ui/CardPrimary";

import { useAppDispatch, useAppSelector } from "@/lib/redux/store/hooks";
import { fetchAllServices } from "@/lib/redux/slices/discoverSlice/discoverserviceSlice";

// const servicesData = [
//   {
//     id: "ai-engineers",
//     name: "Ai Engineers",
//     description:
//       "Machine Learning | Ai Chatbot Development | Agentic workflow | Gen Ai Development | LLM Integration | Neural Networks | Langchain",
//     iconName: "/images/resource-services/ai.svg",
//     technologies: [
//       { id: "ml", name: "Machine Learning" },
//       { id: "chatbot", name: "Ai Chatbot Development" },
//       { id: "agentic", name: "Agentic workflow" },
//       { id: "gen-ai", name: "Gen Ai Development" },
//       { id: "llm", name: "LLM Integration" },
//       { id: "neural", name: "Neural Networks" },
//       { id: "langchain", name: "Langchain" },
//     ],
//   },
//   {
//     id: "ecommerce",
//     name: "E-Commerce",
//     description:
//       "Shopify | Magento | Woocommerce | Big Commerce | Salesforce Commerce Cloud | Theme Customization | Plugin Development",
//     iconName: "/images/resource-services/developer.svg",
//     technologies: [
//       { id: "shopify", name: "Shopify" },
//       { id: "magento", name: "Magento" },
//       { id: "woocommerce", name: "Woocommerce" },
//       { id: "bigcommerce", name: "Big Commerce" },
//       { id: "salesforce", name: "Salesforce Commerce Cloud" },
//       { id: "theme", name: "Theme Customization" },
//       { id: "plugin", name: "Plugin Development" },
//     ],
//   },
//   {
//     id: "java-developer",
//     name: "Java Developer",
//     description:
//       "Spring Boot | Spring Core | Spring Data | Spring MVC | Spring Security | JPA | Core Java | LINQ | Spring Cloud | Hibernate",
//     iconName: "/images/resource-services/developer.svg",
//     technologies: [
//       { id: "spring-boot", name: "Spring Boot" },
//       { id: "spring-core", name: "Spring Core" },
//       { id: "spring-data", name: "Spring Data" },
//       { id: "spring-mvc", name: "Spring MVC" },
//       { id: "spring-security", name: "Spring Security" },
//       { id: "jpa", name: "JPA" },
//       { id: "core-java", name: "Core Java" },
//     ],
//   },
//   {
//     id: "frontend-developer",
//     name: "Front-End Developer",
//     description:
//       "React.js | Next.js Development | HTML 5 | React.js Development | Angular | Vue.js Development | Single Page Applications (SPA)",
//     iconName: "/images/resource-services/developer.svg",
//     technologies: [
//       { id: "react", name: "React.js" },
//       { id: "next", name: "Next.js Development" },
//       { id: "html", name: "HTML 5" },
//       { id: "angular", name: "Angular" },
//       { id: "vue", name: "Vue.js Development" },
//       { id: "spa", name: "Single Page App" },
//     ],
//   },
//   {
//     id: "backend-developer",
//     name: "Back-end Developer",
//     description:
//       "Go | Django & Flask | Java / Spring Boot | Node.JS | Node.js | API Development | GraphQL API Development",
//     iconName: "/images/resource-services/developer.svg",
//     technologies: [
//       { id: "go", name: "Go" },
//       { id: "django", name: "Django & Flask" },
//       { id: "java-spring", name: "Java / Spring Boot" },
//       { id: "node", name: "Node.JS" },
//       { id: "api", name: "API Development" },
//       { id: "graphql", name: "GraphQL API Development" },
//     ],
//   },
//   {
//     id: "design-experts",
//     name: "Design Experts",
//     description:
//       "Website Design | Mobile App Design | Landing Page Design | Wireframe Design | Prototype Design | Brand Book Creation | Company / Investor Dash Design",
//     iconName: "/images/resource-services/designer.svg",
//     technologies: [
//       { id: "web-design", name: "Website Design" },
//       { id: "mobile-app-design", name: "Mobile App Design" },
//       { id: "landing-page", name: "Landing Page Design" },
//       { id: "wireframe", name: "Wireframe Design" },
//       { id: "prototype", name: "Prototype Design" },
//       { id: "brand-book", name: "Brand Book Creation" },
//       { id: "dash-design", name: "Company / Investor Dash Design" },
//     ],
//   },
//   {
//     id: "devsecops",
//     name: "DevSecOps",
//     description:
//       "DevOps / Site Reliability Engineering (SRE) | Cloud & Platform Engineering (AWS, Azure, GCP) | Enterprise Security & Governance | DevSecOps & AI Security | Security Integration | Infrastructure & Network Security",
//     iconName: "/images/resource-services/devops.svg",
//     technologies: [
//       { id: "devops-sre", name: "DevOps / SRE" },
//       { id: "cloud-platform", name: "Cloud & Platform Engineering" },
//       { id: "enterprise-security", name: "Enterprise Security" },
//       { id: "devsecops-ai", name: "DevSecOps & AI Security" },
//       { id: "security-integration", name: "Security Integration" },
//       { id: "infrastructure", name: "Infrastructure & Network Security" },
//     ],
//   },
//   {
//     id: "delivery-excellence",
//     name: "Delivery Excellence",
//     description:
//       "Client Delivery Partner | Project Execution Specialist | Agile Transformation Coach | Product Manager | Strategic Business Analyst | PMP Certified Delivery Leader | Enterprise Solution Consultant",
//     iconName: "/images/resource-services/it-support.svg",
//     technologies: [
//       { id: "delivery-partner", name: "Client Delivery Partner" },
//       { id: "execution-specialist", name: "Project Execution Specialist" },
//       { id: "agile-coach", name: "Agile Transformation Coach" },
//       { id: "product-manager", name: "Product Manager" },
//       { id: "business-analyst", name: "Strategic Business Analyst" },
//       { id: "pmp-leader", name: "PMP Certified Delivery Leader" },
//       { id: "solution-consultant", name: "Enterprise Solution Consultant" },
//     ],
//   },
//   {
//     id: "qa-specialists",
//     name: "Quality Assurance Specialists",
//     description:
//       "Automation Testing | Manual Functional Testing | User Acceptance Testing (UAT) | Performance Testing | Load Testing | API Testing | Database Testing",
//     iconName: "/images/resource-services/quality.svg",
//     technologies: [
//       { id: "automation-testing", name: "Automation Testing" },
//       { id: "manual-testing", name: "Manual Functional Testing" },
//       { id: "uat", name: "User Acceptance Testing (UAT)" },
//       { id: "performance-testing", name: "Performance Testing" },
//       { id: "load-testing", name: "Load Testing" },
//       { id: "api-testing", name: "API Testing" },
//       { id: "database-testing", name: "Database Testing" },
//     ],
//   },
//   {
//     id: "third-party-integration",
//     name: "Third Party Integration",
//     description:
//       "Map & Geolocation APIs | Social Auth & SSO | Payment Gateway Integration | Chat SDK Integration | SMS & Email Service Integration | Analytics & Crash Reporting | Video Conferencing & Streaming",
//     iconName: "/images/resource-services/security.svg",
//     technologies: [
//       { id: "map-apis", name: "Map & Geolocation APIs" },
//       { id: "social-auth", name: "Social Auth & SSO" },
//       { id: "payment-gateway", name: "Payment Gateway Integration" },
//       { id: "chat-sdk", name: "Chat SDK Integration" },
//       { id: "sms-email", name: "SMS & Email Service Integration" },
//       { id: "analytics", name: "Analytics & Crash Reporting" },
//       { id: "video-conferencing", name: "Video Conferencing & Streaming" },
//     ],
//   },
//   {
//     id: "digital-marketing",
//     name: "Digital Marketing",
//     description:
//       "Search Engine Optimization (SEO) | Email Marketing Strategy | Social Marketing | Analytics Expert | Social Media Marketing (SMM) | SEO Expert | Influencer Marketing",
//     iconName: "/images/resource-services/it-support.svg",
//     technologies: [
//       { id: "seo", name: "Search Engine Optimization (SEO)" },
//       { id: "email-marketing", name: "Email Marketing Strategy" },
//       { id: "social-marketing", name: "Social Marketing" },
//       { id: "analytics-expert", name: "Analytics Expert" },
//       { id: "smm", name: "Social Media Marketing (SMM)" },
//       { id: "seo-expert", name: "SEO Expert" },
//       { id: "influencer", name: "Influencer Marketing" },
//     ],
//   },
//   {
//     id: "mobile-app-developer",
//     name: "Mobile App Developer",
//     description:
//       "Flutter Development | React Native Development | App Store Optimization (ASO) | Native iOS (Swift) | App Store & Play Store Deployment | IoT App Integration | Tablet & Foldable App Development",
//     iconName: "/images/resource-services/developer.svg",
//     technologies: [
//       { id: "flutter", name: "Flutter Development" },
//       { id: "react-native", name: "React Native Development" },
//       { id: "aso", name: "App Store Optimization (ASO)" },
//       { id: "native-ios", name: "Native iOS (Swift)" },
//       { id: "deployment", name: "App Store & Play Store Deployment" },
//       { id: "iot", name: "IoT App Integration" },
//       { id: "tablet-foldable", name: "Tablet & Foldable App Development" },
//     ],
//   },
//   {
//     id: "content-writer",
//     name: "Content Writer",
//     description:
//       "SEO Blog Writing | Technical Documentation | API Documentation | Whitepapers | Ad & Sales Copywriting | Email Marketing Sequences | Newsletter Writer",
//     iconName: "/images/resource-services/designer.svg",
//     technologies: [
//       { id: "seo-writing", name: "SEO Blog Writing" },
//       { id: "tech-doc", name: "Technical Documentation" },
//       { id: "api-doc", name: "API Documentation" },
//       { id: "whitepapers", name: "Whitepapers" },
//       { id: "copywriting", name: "Ad & Sales Copywriting" },
//       { id: "email-sequences", name: "Email Marketing Sequences" },
//       { id: "newsletter", name: "Newsletter Writer" },
//     ],
//   },
//   {
//     id: "fullstack-developer",
//     name: "Full Stack Developer",
//     description: "Go | Java / Spring | MEAN | MERN | MEVN | Angular",
//     iconName: "/images/resource-services/developer.svg",
//     technologies: [
//       { id: "go-full", name: "Go" },
//       { id: "java-spring-full", name: "Java / Spring" },
//       { id: "mean", name: "MEAN" },
//       { id: "mern", name: "MERN" },
//       { id: "mevn", name: "MEVN" },
//       { id: "angular-full", name: "Angular" },
//     ],
//   },
//   {
//     id: "data-analyst",
//     name: "Data Analyst",
//     description:
//       "SQL Analysis | Dashboard Creation | KPI Reporting | Forecasting Reports | Customer Analytics | Automated Reporting",
//     iconName: "/images/resource-services/it-support.svg",
//     technologies: [
//       { id: "sql-analysis", name: "SQL Analysis" },
//       { id: "dash-creation", name: "Dashboard Creation" },
//       { id: "kpi-reporting", name: "KPI Reporting" },
//       { id: "forecasting", name: "Forecasting Reports" },
//       { id: "customer-analytics", name: "Customer Analytics" },
//       { id: "automated-reporting", name: "Automated Reporting" },
//     ],
//   },
//   {
//     id: "power-bi",
//     name: "Power BI",
//     description:
//       "Dashboard Development | DAX Development | Performance Engineering | PLS Setup | Data Modeling | Power BI Service Development",
//     iconName: "/images/resource-services/it-support.svg",
//     technologies: [
//       { id: "bi-dash", name: "Dashboard Development" },
//       { id: "dax", name: "DAX Development" },
//       { id: "perf-eng", name: "Performance Engineering" },
//       { id: "pls-setup", name: "PLS Setup" },
//       { id: "data-modeling", name: "Data Modeling" },
//       { id: "bi-service", name: "Power BI Service Development" },
//     ],
//   },
// ];

const BookYourResourceGrid = () => {
  const tBookExperts = useTranslations("bookExperts");
  const tCommon = useTranslations("common");
  const [showAll, setShowAll] = React.useState(false);

  const dispatch = useAppDispatch();
  const { allServices, isLoading, error } = useAppSelector(
    (state) => state.services,
  );

  useEffect(() => {
    dispatch(fetchAllServices());
  }, [dispatch]);

  // allServices is now a flat array from the backend
  const servicesList = Array.isArray(allServices) ? allServices : [];
  const displayedServices = showAll ? servicesList : servicesList.slice(0, 8);
  const totalServices = servicesList.length;

  return (
    <section className="w-full bg-[#F2F9F1] pb-16 md:pb-24 pt-12 sm:pt-16 md:pt-20">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-16">
        {/* Header - ADD THIS SECTION */}
        <div className="mb-12 ">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-2 h-[50px] md:h-[90px] lg:h-[90px] bg-[#78EB54]"></div>
            <div className="flex flex-col gap-2">
              <h2 className="text-[28px] md:text-[48px] font-bold leading-tight text-[#404040] font-['Open_Sauce_One_Bold']">
                {tBookExperts("title")}
              </h2>
              <p className="text-[16spx] md:text-[22px] text-[#636363] font-['Open_Sauce_One_Regular']">
                {tBookExperts("subtitle")}
              </p>
            </div>
          </div>
        </div>
        {/* Small White Cards Grid V3 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 mb-16">
          {isLoading ? (
            <p className="col-span-full text-center text-gray-600">
              {tCommon("loadingServices")}
            </p>
          ) : displayedServices?.length > 0 ? (
            displayedServices.map((service) => (
              <CardPrimary key={service._id} card={service} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600">
              {tBookExperts("noServices")}
            </p>
          )}
        </div>

        {/* Load More Button - Only show if more than 6 services */}
        {totalServices > 6 && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-[#45A735] text-white px-12 py-4 rounded-xl font-bold text-[18px] hover:bg-[#3d942d] transition-all shadow-md active:scale-95"
            >
              {showAll ? "Show Less" : "Load More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookYourResourceGrid;
