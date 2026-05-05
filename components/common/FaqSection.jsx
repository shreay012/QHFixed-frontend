"use client";

import React, { useState } from "react";
import { Box, Typography, Divider } from "@mui/material";

const FaqSection = ({ title, description, faqs }) => {
  const [activeQuestion, setActiveQuestion] = useState(0);

  return (
    <section
      className="py-8 sm:py-16 px-4"
      style={{ backgroundColor: "white" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Typography
            variant="h2"
            className="font-bold text-gray-800 mb-4"
            sx={{
              fontSize: { xs: "22px", md: "40px" },
              fontWeight: 700,
              color: "#404040",
            }}
          >
            {title}
          </Typography>
          {/* {description && (
            <Typography
              sx={{
                fontSize: '16px',
                color: '#6B7280',
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              {description}
            </Typography>
          )} */}
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Questions List */}
          <div className="space-y-2 lg:pr-8 lg:border-r-2 border-gray-200">
            {faqs.map((faq, index) => (
              <React.Fragment key={index}>
                <Box
                  onClick={() => setActiveQuestion(index)}
                  className="cursor-pointer transition-all duration-300"
                  sx={{
                    padding: { xs: "10px 14px", md: "14px 24px" },
                    borderRadius: "12px",
                    backgroundColor:
                      activeQuestion === index ? "#F2F9F1" : "#FFFFFF",
                    //   border: '1px solid',
                    borderColor:
                      activeQuestion === index ? "#45A735" : "#E5E7EB",
                    // "&:hover": {
                    //   backgroundColor:
                    //     activeQuestion === index ? "#E8F5E6" : "#F9FAFB",
                    //   borderColor:
                    //     activeQuestion === index ? "#45A735" : "#D1D5DB",
                    // },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "11px", md: "14px" },
                      fontWeight: activeQuestion === index ? 700 : 500,
                      color: "#404040",
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.question}
                  </Typography>
                </Box>
                {activeQuestion !== index && index < faqs.length - 1 && (
                  <Divider sx={{ borderColor: "#E5E7EB", mb: 1 }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Answer Panel */}
          <div className="lg:pl-8">
            <Box
              className="h-fit"
              sx={{
                padding: { xs: "12px 16px", md: "30px" },
                borderRadius: "16px",
                backgroundColor: "#F2F9F1",

                minHeight: { xs: "140px", md: "320px" },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "11px", md: "18px" },
                  fontWeight: 400,
                  color: "#4B5563",
                  lineHeight: 1.6,
                }}
              >
                {faqs[activeQuestion].answer}
              </Typography>
            </Box>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
