import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  AutoFixHigh as ImproveIcon,
  WorkOutline as ProfessionalIcon,
  EmojiEmotions as CasualIcon,
  CompressOutlined as ConciseIcon,
  UnfoldMore as ElaborateIcon,
} from "@mui/icons-material";
import { useAI } from "../../hooks/useAI";
import toast from "react-hot-toast";

const MessageImprover = ({ open, onClose, originalMessage, onUseImproved }) => {
  const [style, setStyle] = useState("professional");
  const [improvedText, setImprovedText] = useState("");
  const { loading, improveMessage } = useAI();

  const handleImprove = async () => {
    const result = await improveMessage(originalMessage, style);
    if (result) {
      setImprovedText(result);
    }
  };

  const handleUse = () => {
    onUseImproved(improvedText);
    handleClose();
  };

  const handleClose = () => {
    setImprovedText("");
    setStyle("professional");
    onClose();
  };

  const styles = [
    { value: "professional", label: "Professional", icon: <ProfessionalIcon /> },
    { value: "casual", label: "Casual", icon: <CasualIcon /> },
    { value: "concise", label: "Concise", icon: <ConciseIcon /> },
    { value: "elaborate", label: "Elaborate", icon: <ElaborateIcon /> },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#10b981",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ImproveIcon />
          <Typography variant="h6">Improve Message</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
            Original Message
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2">{originalMessage}</Typography>
          </Paper>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select Style
          </Typography>
          <ToggleButtonGroup
            value={style}
            exclusive
            onChange={(e, newStyle) => newStyle && setStyle(newStyle)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {styles.map((s) => (
              <ToggleButton
                key={s.value}
                value={s.value}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  py: 1,
                  "&.Mui-selected": {
                    bgcolor: "#10b981",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#059669",
                    },
                  },
                }}
              >
                {s.icon}
                <Typography variant="caption">{s.label}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Button
            variant="contained"
            onClick={handleImprove}
            disabled={loading}
            fullWidth
            sx={{
              bgcolor: "#10b981",
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                Improving...
              </>
            ) : (
              "Improve Message"
            )}
          </Button>
        </Box>

        {improvedText && (
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Improved Message
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "#ecfdf5",
                border: "1px solid #10b981",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2">{improvedText}</Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleUse}
          disabled={!improvedText}
          sx={{
            bgcolor: "#10b981",
            "&:hover": { bgcolor: "#059669" },
          }}
        >
          Use This Message
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageImprover;
