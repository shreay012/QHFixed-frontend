import { useEffect } from "react";
import ServiceFaq from "./ServiceFaq";
import SelectiveCard from "./SelectiveCard";
import BookingCard from "./BookingCard";
import ServiceHeader from "./ServiceHeader";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store/hooks";
import { fetchServiceById } from "@/lib/redux/slices/bookingSlice/bookingSlice";

export default function LeftComponent({ selectedService }) {

  const dispatch = useAppDispatch();
  const { serviceDetails, isLoading } = useAppSelector(
    (state) => state.booking,
  );

  // Fetch service data once here instead of in each child component.
  // This enriches serviceDetails with any booking-specific fields (pricing, etc.)
  // but we fall back to selectedService immediately so children render right away.
  useEffect(() => {
    if (selectedService?._id) {
      dispatch(fetchServiceById(selectedService._id));
    }
  }, [selectedService?._id, dispatch]);

  // Use already-loaded selectedService as an immediate fallback while the
  // booking-slice fetch is still in flight. This eliminates the blank-content
  // window caused by the two sequential API calls.
  const serviceData = serviceDetails || selectedService || null;

  return (
    <div
    // className="w-[60%] max-h-[calc(100dvh-64px)] overflow-y-auto p-8"
    >
      <ServiceHeader serviceData={serviceData} isLoading={isLoading && !serviceData} />
      <BookingCard serviceData={serviceData} isLoading={isLoading && !serviceData} />
      <SelectiveCard serviceData={serviceData} isLoading={isLoading && !serviceData} />
      <ServiceFaq serviceData={serviceData} isLoading={isLoading && !serviceData} />
    </div>
  );
}
