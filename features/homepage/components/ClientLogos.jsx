// "use client";

// import Image from "next/image";
// import { Box, Container, Typography } from "@mui/material";

// const ClientLogos = () => {
//   const logos = [
//     { name: "Quantiphi", src: "/images/client/quantiphi.svg" },
//     { name: "NinjaCart", src: "/images/client/ninjacart.svg" },

//     { name: "CVent", src: "/images/client/cvent.svg" },
//     { name: "Equabli", src: "/images/client/equabli.svg" },
//     { name: "Navatar", src: "/images/client/navatar.svg" },
//     { name: "DarwinBox", src: "/images/client/darwinbox.svg" },
//     { name: "Fulcrum", src: "/images/client/fulcrum.svg" },
//     { name: "Liftoff", src: "/images/client/liftoff.svg" },
//     { name: "Hoora", src: "/images/client/hoora.svg" },
//     { name: "KFintech", src: "/images/client/kfintech.svg" },
//     // { name: 'Marmeto', src: '/images/client/marmeto.svg' },
//     { name: "Montran", src: "/images/client/montran.svg" },
//     { name: "NCDEX", src: "/images/client/ncdex.svg" },
//     { name: "Oktaio", src: "/images/client/oktaio.svg" },
//     { name: "iHorizons", src: "/images/client/ihorizons.svg" },
//     { name: "Saint", src: "/images/client/saint.svg" },
//     { name: "Cognitive", src: "/images/client/cpgnitive.svg" },
//     { name: "Ecom", src: "/images/client/ecom.svg" },
//   ];

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         py: { xs: 1.5, md: 3 },
//         backgroundColor: "#FFFFFF",
//         overflow: "hidden",
//       }}
//     >
//       <Container maxWidth="xl">
//         <Typography
//           variant="h2"
//           sx={{
//             fontSize: { xs: "20px", md: "20px", lg: "20px" },
//             fontWeight: 700,
//             color: "#322C42",
//             textAlign: "center",
//             mb: { xs: 4, md: 6 },
//           }}
//         >
//           Trusted by 100+ Enterprises
//         </Typography>
//       </Container>

//       {/* Scrolling Logos Container */}
//       <Box
//         sx={{
//           position: "relative",
//           width: "100%",
//           overflow: "hidden",
//           "&::before, &::after": {
//             content: '""',
//             position: "absolute",
//             top: 0,
//             width: "100px",
//             height: "100%",
//             zIndex: 2,
//             pointerEvents: "none",
//           },
//           "&::before": {
//             left: 0,
//             background:
//               "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
//           },
//           "&::after": {
//             right: 0,
//             background:
//               "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
//           },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             gap: 8,
//             animation: {
//               xs: "scroll 12s linear infinite",
//               md: "scroll 20s linear infinite",
//             },
//             "@keyframes scroll": {
//               "0%": {
//                 transform: "translateX(0)",
//               },
//               "100%": {
//                 transform: "translateX(-50%)",
//               },
//             },
//           }}
//         >
//           {/* First set of logos */}
//           {logos.map((logo, index) => (
//             <Box
//               key={`logo-1-${index}`}
//               sx={{
//                 minWidth: "100px",
//                 height: "50px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   transform: "scale(1.1)",
//                 },
//               }}
//             >
//               <Image
//                 src={logo.src}
//                 alt={logo.name}
//                 width={100}
//                 height={50}
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "contain",
//                 }}
//               />
//             </Box>
//           ))}

//           {/* Duplicate set for seamless loop */}
//           {logos.map((logo, index) => (
//             <Box
//               key={`logo-2-${index}`}
//               sx={{
//                 minWidth: "100px",
//                 height: "50px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   transform: "scale(1.1)",
//                 },
//               }}
//             >
//               <Image
//                 src={logo.src}
//                 alt={logo.name}
//                 width={100}
//                 height={50}
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "contain",
//                 }}
//               />
//             </Box>
//           ))}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default ClientLogos;

"use client";

import Image from "next/image";
import { Box, Container, Typography } from "@mui/material";
import { useTranslations } from "next-intl";

const ClientLogos = () => {
  const t = useTranslations("clientLogos");
  const logos = [
    { name: "Quantiphi", src: "/images/client/quantiphi.svg" },
    { name: "NinjaCart", src: "/images/client/ninjacart.svg" },

    { name: "CVent", src: "/images/client/cvent.svg" },
    { name: "Equabli", src: "/images/client/equabli.svg" },
    { name: "Navatar", src: "/images/client/navatar.svg" },
    { name: "DarwinBox", src: "/images/client/darwinbox.svg" },
    { name: "Fulcrum", src: "/images/client/fulcrum.svg" },
    { name: "Liftoff", src: "/images/client/liftoff.svg" },
    { name: "Hoora", src: "/images/client/hoora.svg" },
    { name: "KFintech", src: "/images/client/kfintech.svg" },
    // { name: 'Marmeto', src: '/images/client/marmeto.svg' },
    { name: "Montran", src: "/images/client/montran.svg" },
    { name: "NCDEX", src: "/images/client/ncdex.svg" },
    { name: "Oktaio", src: "/images/client/oktaio.svg" },
    { name: "iHorizons", src: "/images/client/ihorizons.svg" },
    { name: "Saint", src: "/images/client/saint.svg" },
    { name: "Cognitive", src: "/images/client/cpgnitive.svg" },
    { name: "Ecom", src: "/images/client/ecom.svg" },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 1.5, md: 3 },
        backgroundColor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h2"
          sx={{
            fontSize: { xs: "20px", md: "20px", lg: "20px" },
            fontWeight: 700,
            color: "#322C42",
            textAlign: "center",
            mb: { xs: 4, md: 6 },
          }}
        >
          {t("title")}
        </Typography>
      </Container>

      {/* Scrolling Logos Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: 0,
            width: "100px",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
          },
          "&::before": {
            left: 0,
            background:
              "linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0))",
          },
          "&::after": {
            right: 0,
            background:
              "linear-gradient(to left, rgba(255,255,255,1), rgba(255,255,255,0))",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 8,
            animation: {
              xs: "scroll 4s linear infinite",
              md: "scroll 20s linear infinite",
            },
            "@keyframes scroll": {
              "0%": {
                transform: "translateX(0)",
              },
              "100%": {
                transform: "translateX(-50%)",
              },
            },
          }}
        >
          {/* First set of logos */}
          {logos.map((logo, index) => (
            <Box
              key={`logo-1-${index}`}
              sx={{
                minWidth: "100px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={100}
                height={50}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          ))}

          {/* Duplicate set for seamless loop */}
          {logos.map((logo, index) => (
            <Box
              key={`logo-2-${index}`}
              sx={{
                minWidth: "100px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <Image
                src={logo.src}
                alt={logo.name}
                width={100}
                height={50}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientLogos;
