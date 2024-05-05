import React, { useState } from "react";
import { Typography, Popover, Box, Stack } from "@mui/material";
import DragIndicator from "@mui/icons-material/DragIndicator";
import Draggable, { DraggableEventHandler } from "react-draggable";

function DraggableSubtitles({ transcriptLine }: { transcriptLine: string }) {
  const [popoverPos, setPopoverPos] = useState({ x: 20, y: -20 });
  const [open, setOpen] = useState(true);

  const handleDrag: DraggableEventHandler = (e, data) => {
    setPopoverPos({ x: data.x, y: data.y });
  };

  const anchorElFake = {
    getBoundingClientRect: () => ({
      top: popoverPos.y,
      left: popoverPos.x,
      right: popoverPos.x,
      bottom: popoverPos.y,
      width: 0,
      height: 0,
    }),
  };

  return (
    <div>
      <Draggable onDrag={handleDrag}>
        <div>
          {/* Invisible box that serves as the draggable handler */}
          <Popover
            id="draggable-dialog-title"
            open={open}
            anchorEl={anchorElFake}
            sx={{
              cursor: "move",
              position: "fixed",
              top: popoverPos.y,
              left: popoverPos.x,
              zIndex: 1302,
            }}
            onClose={() => setOpen(false)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            PaperProps={{
              elevation: 3,
            }}
          >
            <Stack direction="row" alignItems="center" minHeight={50}>
              <DragIndicator />
              <Typography variant="subtitle1" sx={{ p: 2 }}>
                {transcriptLine}
              </Typography>
            </Stack>
          </Popover>
        </div>
      </Draggable>
    </div>
  );
}

export default DraggableSubtitles;
