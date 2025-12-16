import { useEffect, useState } from "react";
import axios from "axios";

export const useAdminFetchData = (url, key) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("chattu-admin-token");
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get(url, config);
        setData(response.data);
      } catch (err) {
        console.error("Admin fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, key]);

  return { data, loading, error };
};
