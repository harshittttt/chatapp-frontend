import { useState } from "react";
import axios from "axios";
import { server } from "../constants/config";
import toast from "react-hot-toast";

// Get auth token
const getAuthConfig = () => {
  const token = localStorage.getItem("chattu-token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Custom hook for AI features
export const useAI = () => {
  const [loading, setLoading] = useState(false);

  const getSmartReplies = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/ai/smart-replies`,
        { chatId },
        getAuthConfig()
      );
      return data.suggestions;
    } catch (error) {
      console.error("Smart replies error:", error);
      toast.error("Failed to get smart replies");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const summarizeChat = async (chatId, messageCount = 50) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/ai/summarize`,
        { chatId, messageCount },
        getAuthConfig()
      );
      return data.summary;
    } catch (error) {
      console.error("Summarize error:", error);
      toast.error(error.response?.data?.message || "Failed to summarize chat");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const chatWithAI = async (query, chatId = null) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/ai/chat`,
        { query, chatId },
        getAuthConfig()
      );
      return data.response;
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error("Failed to get AI response");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const improveMessage = async (message, style = "professional") => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/ai/improve`,
        { message, style },
        getAuthConfig()
      );
      return data.improved;
    } catch (error) {
      console.error("Improve message error:", error);
      toast.error("Failed to improve message");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const translateMessage = async (message, targetLanguage) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/ai/translate`,
        { message, targetLanguage },
        getAuthConfig()
      );
      return data.translated;
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Failed to translate message");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getSmartReplies,
    summarizeChat,
    chatWithAI,
    improveMessage,
    translateMessage,
  };
};
