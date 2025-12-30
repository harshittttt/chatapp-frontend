import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import {
  AutoAwesome as SparkleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

const SmartReplies = ({ suggestions, loading, onSelectReply, onClose }) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Getting smart replies...
        </Typography>
      </Box>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        bgcolor: "#f8f9ff",
        borderRadius: 2,
        border: "1px solid #e0e7ff",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SparkleIcon sx={{ fontSize: 16, color: "#667eea" }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "#667eea" }}
          >
            Smart Replies
          </Typography>
        </Box>

        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: "#667eea",
              p: 0.25,
              "&:hover": { bgcolor: "rgba(102, 126, 234, 0.12)" },
            }}
            aria-label="Close smart replies"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {suggestions.map((suggestion, index) => (
          <Chip
            key={index}
            label={suggestion}
            onClick={() => onSelectReply(suggestion)}
            sx={{
              bgcolor: "white",
              border: "1px solid #667eea",
              color: "#667eea",
              "&:hover": {
                bgcolor: "#667eea",
                color: "white",
              },
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default SmartReplies;
