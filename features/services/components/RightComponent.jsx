"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { guestAccess } from "@/lib/redux/slices/authSlice/authSlice";
import { StepperProvider } from "./ProcessStepper/StepperContext";
import ProcessStepper from "./ProcessStepper";
import StepContent from "./ProcessStepper/StepContent";

const RightComponent = ({ serviceId, selectedService }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, guestToken } = useSelector((state) => state.auth);

  // Ensure guest users have a temporary token so API calls
  // (pricing, availability) don't 401 before they reach step 4 login.
  useEffect(() => {
    if (!isAuthenticated && !guestToken && typeof window !== "undefined") {
      const existingToken = localStorage.getItem("token");
      const existingGuest = localStorage.getItem("guestToken");
      if (!existingToken && !existingGuest) {
        dispatch(guestAccess());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StepperProvider>
      <div className="bg-white h-full flex flex-col">
        {/* Fixed Top - Stepper */}
        <div className="px-4 sm:px-6 lg:px-0 pt-6 pb-2">
          <ProcessStepper />
        </div>

        {/* Scrollable Content - Step Content with Buttons */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 sm:px-6 lg:px-0">
          <StepContent
            serviceId={serviceId}
            selectedService={selectedService}
          />
        </div>
      </div>
    </StepperProvider>
  );
};

export default RightComponent;
