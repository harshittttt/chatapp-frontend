import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "../../constants/config";
import axios from "axios";

const adminLogin = createAsyncThunk("admin/login", async (secretKey) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const { data } = await axios.post(
      `${server}/api/v1/admin/verify`,
      { secretKey },
      config
    );

    // Store admin token in localStorage
    if (data.token) {
      localStorage.setItem("chattu-admin-token", data.token);
    }

    return data.message;
  } catch (error) {
    throw error.response.data.message;
  }
});

const getAdmin = createAsyncThunk("admin/getAdmin", async () => {
  try {
    const token = localStorage.getItem("chattu-admin-token");
    
    const { data } = await axios.get(`${server}/api/v1/admin/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return data.admin;
  } catch (error) {
    throw error.response.data.message;
  }
});

const adminLogout = createAsyncThunk("admin/logout", async () => {
  try {
    const token = localStorage.getItem("chattu-admin-token");
    
    const { data } = await axios.get(`${server}/api/v1/admin/logout`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Remove admin token from localStorage
    localStorage.removeItem("chattu-admin-token");

    return data.message;
  } catch (error) {
    throw error.response.data.message;
  }
});

export { adminLogin, getAdmin, adminLogout };
