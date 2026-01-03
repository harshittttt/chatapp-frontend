import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageReactions = ({ onSelect, size = "small" }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        bgcolor: "white",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 999,
        px: 0.75,
        py: 0.25,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      {REACTIONS.map((r) => (
        <Tooltip key={r} title={r} arrow>
          <IconButton
            size={size}
            onClick={() => onSelect(r)}
            sx={{
              p: 0.5,
              lineHeight: 1,
              fontSize: 16,
            }}
          >
            <span style={{ fontSize: 16 }}>{r}</span>
          </IconButton>
        </Tooltip>
      ))}
    </Box>
  );
};

export default MessageReactions;
