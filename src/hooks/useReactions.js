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

export const useReactions = () => {
  const [loading, setLoading] = useState(false);

  const upsertReaction = async ({ messageId, emoji }) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/reaction`,
        { messageId, emoji },
        getAuthConfig()
      );
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to react");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removeReaction = async (messageId) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(
        `${server}/api/v1/reaction/${messageId}`,
        getAuthConfig()
      );
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove reaction");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, upsertReaction, removeReaction };
};
