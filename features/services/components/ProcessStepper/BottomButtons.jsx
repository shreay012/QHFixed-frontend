"use client";

import React from "react";
import { Box, Button } from "@mui/material";
import { useTranslations } from "next-intl";
import { useStepperContext } from "./StepperContext";

const BottomButtons = ({
  onContinue,
  continueDisabled = false,
  continueLabel,
  isLoading = false,
}) => {
  const { previousStep, isFirstStep } = useStepperContext();
  const t = useTranslations("stepper");
  const label = continueLabel ?? t("continue");

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}
    >
      {/* Back Button - Hidden on first step */}
      {!isFirstStep && (
        <Button
          onClick={previousStep}
          sx={{
            backgroundColor: "var(--text-tertiary)",
            color: "var(--text-primary)",
            fontSize: { xs: "16px", sm: "17px", md: "var(--font-size-18)" },
            fontWeight: "var(--font-weight-400)",
            padding: { xs: "12px 48px", sm: "13px 56px", md: "14px 64px" },
            borderRadius: "8px",
            textTransform: "none",
            boxShadow: "none",
            width: { xs: "48%", sm: "auto" },
            "&:hover": {
              backgroundColor: "var(--text-tertiary)",
              boxShadow: "none",
            },
            transition: "all 0.3s ease",
          }}
        >
          {t("back")}
        </Button>
      )}

      {/* Continue Button */}
      <Button
        onClick={onContinue}
        disabled={continueDisabled || isLoading}
        sx={{
          backgroundColor: "#45A735",
          color: "#FFFFFF",
          fontSize: { xs: "16px", sm: "17px", md: "18px" },
          fontWeight: 600,
          padding: { xs: "12px 48px", sm: "13px 56px", md: "14px 64px" },
          borderRadius: "12px",
          textTransform: "none",
          boxShadow: "none",
          width: { xs: isFirstStep ? "100%" : "48%", sm: "auto" },
          marginLeft: isFirstStep ? "auto" : 0,
          "&:hover": {
            backgroundColor: "#3D9330",
            boxShadow: "none",
          },
          "&:disabled": {
            backgroundColor: "#D1D5DB",
            color: "#9CA3AF",
            cursor: "not-allowed",
          },
          transition: "all 0.3s ease",
        }}
      >
        {isLoading ? t("loading") : label}
      </Button>
    </Box>
  );
};

export default BottomButtons;
