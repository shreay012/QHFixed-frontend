"use client";

import { Button } from "@mui/material";
import Link from "next/link";
import { useTranslations } from "next-intl";

const ButtonPrimaryhowitwork = ({
  text,
  bgColor = "#3FA12B",
  hoverBgColor = "#000000",
  shadowColor = " 0px 18px 38px rgba(63, 143, 50, 0.9)",
  href = "/book-your-resource",
}) => {
  const t = useTranslations("common");
  const label = text ?? t("hireIn10Minutes");
  return (
    <>
      <Link href={href} style={{ textDecoration: "none" }}>
        <Button
          variant="contained"
          className="rounded-xl px-[24px]! py-[18px]!"
          sx={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: bgColor,
            textTransform: "none",
            fontFamily: "'Open Sauce One Regular'",
            fontWeight: 700,
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "0px",
            textAlign: "center",
            borderRadius: "8px",
            boxShadow: "none",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              backgroundColor: hoverBgColor,
              transition: "left 0.5s ease",
              zIndex: 0,
            },
            "&:hover": {
              boxShadow: shadowColor,
            },
            "&:hover::before": {
              left: 0,
            },
            "&:active": {
              boxShadow: shadowColor,
              transform: "translateY(1px)",
            },
            "&:active::before": {
              left: 0,
            },
            "&:focus-visible": {
              boxShadow: shadowColor,
            },
            "&:focus-visible::before": {
              left: 0,
            },
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
        </Button>
      </Link>
    </>
  );
};

export default ButtonPrimaryhowitwork;
