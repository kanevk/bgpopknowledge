import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import React from "react";

function SubtitleRevealer({
  text,
  prevLine,
}: {
  text: string;
  prevLine: string;
}) {
  const words = text?.split(" ") || [];

  return (
    <div className="subtitle-container">
      <Typography variant="h3" maxWidth={900} marginX={10}>
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
