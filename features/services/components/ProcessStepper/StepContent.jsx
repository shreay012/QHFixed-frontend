"use client";

import React from "react";
import { useStepperContext } from "./StepperContext";
import ServicesStep from "./ServicesStep";
import HoursStep from "./HoursStep";
import SummaryStep from "./SummaryStep";
import DetailsStep from "./DetailsStep";
import PaymentStep from "./PaymentStep";

const StepContent = ({ serviceId, selectedService }) => {
  const { activeStep, isAuthenticated, isDetailsCompleted } =
    useStepperContext();
  const renderStepContent = () => {
    if (isAuthenticated && isDetailsCompleted) {
      // When logged in AND details completed: Services(0), Hours(1), Summary(2), Payment(3)
      switch (activeStep) {
        case 0:
          return (
            <ServicesStep
              serviceId={serviceId}
              selectedService={selectedService}
            />
          );
        case 1:
          return (
            <HoursStep
              serviceId={serviceId}
              selectedService={selectedService}
            />
          );
        case 2:
          return (
            <SummaryStep
              serviceId={serviceId}
              selectedService={selectedService}
            />
          );
        case 3:
          return <PaymentStep />;
        default:
          return <ServicesStep />;
      }
    } else {
      // When not logged in: Services(0), Hours(1), Summary(2), Details(3), Payment(4)
      switch (activeStep) {
        case 0:
          return (
            <ServicesStep
              serviceId={serviceId}
              selectedService={selectedService}
            />
          );
        case 1:
          return (
            <HoursStep
              serviceId={serviceId}
              selectedService={selectedService}
            />
          );
        case 2:
          return (
            <SummaryStep
              serviceId={serviceId}
              selectedService={selectedService}
            />
          );
        case 3:
          return <DetailsStep />;
        case 4:
          return <PaymentStep />;
        default:
          return <ServicesStep />;
      }
    }
  };

  return <>{renderStepContent()}</>;
};

export default StepContent;
