"use client";
import { showError, showSuccess } from '@/lib/utils/toast';

import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { useDispatch } from "react-redux";
import { useStepperContext } from "./ProcessStepper/StepperContext";
import { fetchPricing } from "@/lib/redux/slices/pricingSlice/pricingSlice";

const Bottombutton = () => {
  const dispatch = useDispatch();
  const {
    nextStep,
    previousStep,
    isLastStep,
    isFirstStep,
    activeStep,
    selectedTechnologies,
    selectedService,
    hoursBookingData,
    termsAccepted,
  } = useStepperContext();

  const [isPricingLoading, setIsPricingLoading] = useState(false);

  const isContinueDisabled =
    (activeStep === 0 && selectedTechnologies.length === 0) ||
    (activeStep === 1 && !hoursBookingData) ||
    (activeStep === 2 && !termsAccepted) ||
    isPricingLoading;

  const handleContinue = async () => {
    // Save to localStorage when moving from Services step (step 0)
    if (activeStep === 0 && selectedService) {
      // Get selected technology names
      const selectedTechObjects =
        selectedService.technologies?.filter((tech) =>
          selectedTechnologies.includes(tech._id || tech.id),
        ) || [];
      const techNames = selectedTechObjects.map((tech) => tech.name).join(", ");

      // Save to localStorage
      localStorage.setItem("_service_id", selectedService._id);
      localStorage.setItem("_service_name", selectedService.name);
      localStorage.setItem(
        "_selected_tech_ids",
        JSON.stringify(selectedTechnologies),
      );
      localStorage.setItem("_technologies_names", techNames);

        _service_id: selectedService._id,
        _service_name: selectedService.name,
        _selected_tech_ids: selectedTechnologies,
        _technologies_names: techNames,
      });
    }

    // Handle Hours step (activeStep === 1) - Call Pricing API
    if (activeStep === 1 && hoursBookingData) {
      const {
        selectedPlan,
        selectedAssignment,
        selectedDate,
        selectedSlotDetails,
      } = hoursBookingData;

      // Get data from localStorage
      const storedTechIds = localStorage.getItem("_selected_tech_ids");
      const techIds = storedTechIds ? JSON.parse(storedTechIds) : [];
      const serviceId = localStorage.getItem("_service_id");

      if (!serviceId) {
        console.error("❌ Service ID not found in localStorage");
        showError("Service ID is missing. Please go back and select a service.");
        return;
      }

      // Extract duration from selected plan
      let durationTime = 9; // Default
      if (selectedPlan === "plan-4") durationTime = 4;
      else if (selectedPlan === "plan-8") durationTime = 8;
      else if (selectedPlan === "plan-custom") durationTime = 9;

      // Handle instant vs schedule bookings differently
      let pricingPayload;

      if (selectedAssignment === "instant") {
        // For instant booking: use current date/time with assigned slot
        const currentDateTime = new Date().toISOString();

        pricingPayload = {
          services: [
            {
              serviceId: serviceId,
              technologyIds: techIds,
              selectedDays: 1,
              requirements: "Selected from web v3",
              preferredStartDate: currentDateTime,
              preferredEndDate: currentDateTime,
              durationTime: durationTime,
              startTime: selectedSlotDetails?.startTime || "",
              endTime: selectedSlotDetails?.endTime || "",
              timeSlot: {
                startTime: selectedSlotDetails?.startTime || "",
                endTime: selectedSlotDetails?.endTime || "",
              },
              bookingType: "instant",
            },
          ],
        };
      } else {
        // For schedule booking: use selected date and time
        const formattedDate = selectedDate.toISOString();

        pricingPayload = {
          services: [
            {
              serviceId: serviceId,
              technologyIds: techIds,
              selectedDays: 1,
              requirements: "Selected from web v3",
              preferredStartDate: formattedDate,
              preferredEndDate: formattedDate,
              durationTime: durationTime,
              startTime: selectedSlotDetails.startTime,
              endTime: selectedSlotDetails.endTime,
              timeSlot: {
                startTime: selectedSlotDetails.startTime,
                endTime: selectedSlotDetails.endTime,
              },
              bookingType: "later",
            },
          ],
        };
      }

      try {
        setIsPricingLoading(true);

        // Call pricing API using Redux
        const resultAction = await dispatch(fetchPricing(pricingPayload));

        if (fetchPricing.fulfilled.match(resultAction)) {

          // Save booking data to localStorage
          if (selectedAssignment === "instant") {
            // For instant booking, save current date/time with assigned slot
            const currentDateTime = new Date().toISOString();
            localStorage.setItem("_selected_date", currentDateTime);
            localStorage.setItem(
              "_selected_time_slot",
              JSON.stringify({
                startTime: selectedSlotDetails?.startTime || "",
                endTime: selectedSlotDetails?.endTime || "",
              }),
            );
          } else {
            // For schedule booking, save selected date/time
            const formattedDate = selectedDate.toISOString();
            localStorage.setItem("_selected_date", formattedDate);
            localStorage.setItem(
              "_selected_time_slot",
              JSON.stringify({
                startTime: selectedSlotDetails.startTime,
                endTime: selectedSlotDetails.endTime,
              }),
            );
          }

          localStorage.setItem("_selected_plan", selectedPlan);
          localStorage.setItem("_selected_assignment_type", selectedAssignment);
          localStorage.setItem("_duration_time", durationTime.toString());

          // Save pricing response if needed
          localStorage.setItem(
            "_pricing_data",
            JSON.stringify(resultAction.payload),
          );


          if (selectedAssignment === "instant") {
            if (selectedSlotDetails) {
                "⏰ Assigned Time Slot:",
                `${selectedSlotDetails.start} - ${selectedSlotDetails.end}`,
              );
            }
          } else {
              "⏰ Time:",
              `${selectedSlotDetails.start} - ${selectedSlotDetails.end}`,
            );
          }

          // Move to next step
          nextStep();
        } else {
          // Handle rejected case
          console.error("❌ Pricing API Error:", resultAction.payload);
          showError("Failed to get pricing. Please try again.");
        }
      } catch (error) {
        console.error("❌ Pricing API Error:", error);
        showError("Failed to get pricing. Please try again.");
      } finally {
        setIsPricingLoading(false);
      }
      return;
    }

    if (isLastStep) {
      
      // Handle form submission or payment on last step
      // You can add your submission logic here
    } else {
      
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

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
          onClick={handleBack}
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
          Back
        </Button>
      )}

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={isContinueDisabled}
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
        {isPricingLoading
          ? "Loading..."
          : isLastStep
            ? "Complete Payment"
            : "Continue"}
      </Button>
    </Box>
  );
};

export default Bottombutton;
