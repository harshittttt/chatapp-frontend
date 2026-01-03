import { useState } from "react";
import axios from "axios";
import { server } from "../constants/config";

const getAuthConfig = () => {
  const token = localStorage.getItem("chattu-token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const useReceipts = () => {
  const [loading, setLoading] = useState(false);

  const markDelivered = async (messageId) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/message/${messageId}/delivered`,
        {},
        getAuthConfig()
      );
      return data;
    } finally {
      setLoading(false);
    }
  };

  const markSeen = async (messageId) => {
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/message/${messageId}/seen`,
        {},
        getAuthConfig()
      );
      return data;
    } finally {
      setLoading(false);
    }
  };

  return { loading, markDelivered, markSeen };
};
