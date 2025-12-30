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
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useAI } from "../../hooks/useAI";

const AIChatAssistant = ({ open, onClose, chatId }) => {
  const [query, setQuery] = useState("");
  const [conversation, setConversation] = useState([]);
  const { loading, chatWithAI } = useAI();

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    const userMessage = { type: "user", content: query };
    setConversation((prev) => [...prev, userMessage]);
    setQuery("");

    const response = await chatWithAI(query, chatId);
    if (response) {
      const aiMessage = { type: "ai", content: response };
      setConversation((prev) => [...prev, aiMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuery();
    }
  };

  const handleClose = () => {
    setConversation([]);
    setQuery("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#667eea",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AIIcon />
          <Typography variant="h6">AI Assistant</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, minHeight: "400px", maxHeight: "500px" }}>
        {conversation.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <AIIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom>
              How can I help you?
            </Typography>
            <Typography variant="body2" textAlign="center">
              Ask me anything about this conversation, get suggestions, or just
              chat!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {conversation.map((msg, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2,
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  bgcolor: msg.type === "user" ? "#667eea" : "#f5f5f5",
                  color: msg.type === "user" ? "white" : "black",
                  maxWidth: "80%",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    display: "block",
                    mb: 0.5,
                    opacity: 0.8,
                  }}
                >
                  {msg.type === "user" ? "You" : "AI Assistant"}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </Typography>
              </Paper>
            ))}
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  AI is thinking...
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={3}
          />
          <Button
            variant="contained"
            onClick={handleSendQuery}
            disabled={loading || !query.trim()}
            sx={{
              minWidth: "auto",
              bgcolor: "#667eea",
              "&:hover": { bgcolor: "#5568d3" },
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AIChatAssistant;
