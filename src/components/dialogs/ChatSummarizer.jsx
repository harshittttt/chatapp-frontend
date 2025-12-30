import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Paper,
  TextField,
} from "@mui/material";
import {
  Close as CloseIcon,
  Summarize as SummarizeIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";
import { useAI } from "../../hooks/useAI";
import toast from "react-hot-toast";

const ChatSummarizer = ({ open, onClose, chatId }) => {
  const [summary, setSummary] = useState("");
  const [messageCount, setMessageCount] = useState(50);
  const { loading, summarizeChat } = useAI();

  const handleSummarize = async () => {
    const result = await summarizeChat(chatId, messageCount);
    if (result) {
      setSummary(result);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
  };

  const handleClose = () => {
    setSummary("");
    setMessageCount(50);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#f59e0b",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SummarizeIcon />
          <Typography variant="h6">Summarize Conversation</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!summary ? (
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              Generate a concise summary of your conversation. The AI will
              highlight key points, decisions, and action items.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Number of Messages to Summarize
              </Typography>
              <TextField
                type="number"
                value={messageCount}
                onChange={(e) => setMessageCount(Number(e.target.value))}
                inputProps={{ min: 10, max: 200 }}
                fullWidth
                size="small"
                helperText="Choose between 10 and 200 messages"
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSummarize}
              disabled={loading}
              fullWidth
              sx={{
                bgcolor: "#f59e0b",
                "&:hover": { bgcolor: "#d97706" },
                py: 1.5,
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                  Generating Summary...
                </>
              ) : (
                <>
                  <SummarizeIcon sx={{ mr: 1 }} />
                  Generate Summary
                </>
              )}
            </Button>
          </Box>
        ) : (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Summary
              </Typography>
              <Button
                startIcon={<CopyIcon />}
                onClick={handleCopy}
                size="small"
                sx={{ color: "#f59e0b" }}
              >
                Copy
              </Button>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 2,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
              >
                {summary}
              </Typography>
            </Paper>

            <Button
              variant="outlined"
              onClick={() => setSummary("")}
              fullWidth
              sx={{
                mt: 2,
                color: "#f59e0b",
                borderColor: "#f59e0b",
                "&:hover": {
                  borderColor: "#d97706",
                  bgcolor: "#fffbeb",
                },
              }}
            >
              Generate New Summary
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChatSummarizer;
