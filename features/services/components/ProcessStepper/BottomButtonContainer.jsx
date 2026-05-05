"use client";
import { showError, showSuccess } from '@/lib/utils/toast';

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useStepperContext } from "./StepperContext";
import { fetchPricing } from "@/lib/redux/slices/pricingSlice/pricingSlice";
import BottomButtons from "./BottomButtons";

const BottomButtonContainer = () => {
  const dispatch = useDispatch();
  const {
    nextStep,
    activeStep,
    selectedTechnologies,
    selectedService,
    hoursBookingData,
    termsAccepted,
    isAuthenticated,
  } = useStepperContext();

  const [isPricingLoading, setIsPricingLoading] = useState(false);

  // Hide buttons on  step (step 3) when not authenticated - it has its own buttons
  if (!isAuthenticated && activeStep === 3) {
    return null;
  }

  // Calculate if continue should be disabled based on current step
  const getContinueDisabled = () => {
    if (activeStep === 0) return selectedTechnologies.length === 0;
    if (activeStep === 1) return !hoursBookingData || isPricingLoading;
    if (activeStep === 2) return !termsAccepted;
    if (!isAuthenticated && activeStep === 3) return true; // Details step handles its own validation
    return false;
  };

  // Get continue button label based on current step
  const getContinueLabel = () => {
    if (isPricingLoading) return "Loading...";
    if (activeStep === 1 && hoursBookingData) return "Continue";
    if (!isAuthenticated && activeStep === 3) return "Continue"; // Details step
    if (
      (isAuthenticated && activeStep === 3) ||
      (!isAuthenticated && activeStep === 4)
    ) {
      return "Complete Payment";
    }
    return "Continue";
  };

  const handleContinue = async () => {
    // Services Step (0)
    if (activeStep === 0 && selectedService) {
      const selectedTechObjects =
        selectedService.technologies?.filter((tech) =>
          selectedTechnologies.includes(tech._id || tech.id),
        ) || [];
      const techNames = selectedTechObjects.map((tech) => tech.name).join(", ");

      localStorage.setItem("_service_id", selectedService._id);
      localStorage.setItem("_service_name", selectedService.name);
      localStorage.setItem(
        "_selected_tech_ids",
        JSON.stringify(selectedTechnologies),
      );
      localStorage.setItem("_technologies_names", techNames);

      nextStep();
      return;
    }

    // Hours Step (1) - Call Pricing API
    if (activeStep === 1 && hoursBookingData) {
      const {
        selectedPlan,
        selectedAssignment,
        selectedDate,
        selectedSlotDetails,
      } = hoursBookingData;
      const storedTechIds = localStorage.getItem("_selected_tech_ids");
      const techIds = storedTechIds ? JSON.parse(storedTechIds) : [];
      const serviceId = localStorage.getItem("_service_id");

      if (!serviceId) {
        showError("Service ID is missing. Please go back and select a service.");
        return;
      }

      let durationTime = 9;
      if (selectedPlan === "plan-4") durationTime = 4;
      else if (selectedPlan === "plan-8") durationTime = 8;
      else if (selectedPlan === "plan-custom") durationTime = 9;

      let pricingPayload;
      if (selectedAssignment === "instant") {
        const currentDateTime = new Date().toISOString();
        pricingPayload = {
          services: [
            {
              serviceId,
              technologyIds: techIds,
              selectedDays: 1,
              requirements: "Selected from web v3",
              preferredStartDate: currentDateTime,
              preferredEndDate: currentDateTime,
              durationTime,
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
        const formattedDate = selectedDate.toISOString();
        pricingPayload = {
          services: [
            {
              serviceId,
              technologyIds: techIds,
              selectedDays: 1,
              requirements: "Selected from web v3",
              preferredStartDate: formattedDate,
              preferredEndDate: formattedDate,
              durationTime,
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
        const resultAction = await dispatch(fetchPricing(pricingPayload));

        if (fetchPricing.fulfilled.match(resultAction)) {
          if (selectedAssignment === "instant") {
            localStorage.setItem("_selected_date", new Date().toISOString());
            localStorage.setItem(
              "_selected_time_slot",
              JSON.stringify({
                startTime: selectedSlotDetails?.startTime || "",
                endTime: selectedSlotDetails?.endTime || "",
              }),
            );
          } else {
            localStorage.setItem("_selected_date", selectedDate.toISOString());
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
          localStorage.setItem(
            "_pricing_data",
            JSON.stringify(resultAction.payload),
          );
          nextStep();
        } else {
          showError("Failed to get pricing. Please try again.");
        }
      } catch (error) {
        showError("Failed to get pricing. Please try again.");
      } finally {
        setIsPricingLoading(false);
      }
      return;
    }

    // Summary Step (2) and Details Step (3) - just move forward
    // Details step has its own internal continue button with complex logic
    if (activeStep === 2) {
      nextStep();
      return;
    }

    // Details step (3 for non-authenticated) - handled by DetailsStep component itself
    // Payment step - handle payment
    nextStep();
  };

  return (
    <BottomButtons
      onContinue={handleContinue}
      continueDisabled={getContinueDisabled()}
      continueLabel={getContinueLabel()}
      isLoading={isPricingLoading}
    />
  );
};

export default BottomButtonContainer;
