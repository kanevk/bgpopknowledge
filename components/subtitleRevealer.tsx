import { Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

function SubtitleRevealer({ text }: { text: string }) {
  const words = text?.split(" ") || [];
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <div className="subtitle-container">
      <Typography
        variant={isMobile ? "h6" : "body1"}
        maxWidth={900}
        color={theme.palette.common.white}
        {...(isMobile ? {} : { marginX: 15 })}
      >
        {words.map((word, index) => (
          <Typography
            key={`${word}-${index}`}
            fontSize={30}
            component="span"
            sx={{
              opacity: 0,
              animation: `reveal 0.2s forwards ${index * 0.2}s`,
              "@keyframes reveal": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {word}{" "}
          </Typography>
        ))}
      </Typography>
    </div>
  );
}

export default SubtitleRevealer;
