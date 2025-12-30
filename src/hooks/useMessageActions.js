import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../constants/config";

const getAuthConfig = () => {
  const token = localStorage.getItem("chattu-token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const useMessageActions = () => {
  const [loading, setLoading] = useState(false);

  const updateMessage = async (messageId, content) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/message/${messageId}`,
        { content },
        getAuthConfig()
      );
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update message");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(
        `${server}/api/v1/message/${messageId}`,
        getAuthConfig()
      );
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateMessage, deleteMessage };
};
