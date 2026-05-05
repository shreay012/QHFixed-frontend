import Skeleton from "@mui/material/Skeleton";

const ServiceCardSkeleton = () => {
  return (
    <div
      className="card-primary card-primary-before mb-3 w-full cursor-pointer"
      style={{
        maxWidth: "154px",
        minHeight: "100px",
        gap: "9.46px",
        opacity: 1,
        paddingTop: "12px",
        paddingBottom: "12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Icon skeleton */}
      <div className="flex items-center justify-center">
        <Skeleton
          variant="circular"
          animation="wave"
          width={42}
          height={42}
          className="sm:w-[52px] sm:h-[52px]"
        />
      </div>
      
      {/* Text skeleton */}
      <Skeleton
        variant="text"
        animation="wave"
        width="90%"
        height={16}
        className="text-[9px] sm:text-base"
        style={{ marginTop: "8px" }}
      />
    </div>
  );
};

export default ServiceCardSkeleton;
