import axios from "axios";
import FormData from "form-data";

// Zippyshare API keys
const ZIPPYSHARE_KEY1 = "G4RRKadRUna95gWJ2LXCIq8Vv0HoiK8p3MuYLw2IvxS58CJ4nFjeK7PT6YaCXCFT";
const ZIPPYSHARE_KEY2 = "2n3yVvUBmO1KYVJUFGWHfcJ68VBDn105yCe12o6OLa3FAdxnPDnjEqPnbNe63SHE";

// Base URL for Zippyshare API
const API_BASE_URL = "https://www.zippyshare.cloud/api/v2/";

// Interface for auth response
interface AuthResponse {
  data?: {
    access_token: string;
    account_id: string;
  };
  response?: string;
  _status: string;
  _datetime: string;
}

// Function to authenticate with Zippyshare using JSON
export const getZippyshareAuthJSON = async (): Promise<{ accessToken: string; accountId: string }> => {
  try {
    console.log("Testing JSON method");
    const requestBody = {
      key1: ZIPPYSHARE_KEY1,
      key2: ZIPPYSHARE_KEY2,
    };
    console.log("Request URL:", `${API_BASE_URL}authorize`);
    console.log("Request Body:", requestBody);
    console.log("Key1 length:", ZIPPYSHARE_KEY1.length);
    console.log("Key2 length:", ZIPPYSHARE_KEY2.length);
    console.log("Key1 JSON:", JSON.stringify(ZIPPYSHARE_KEY1)); // Check for hidden characters
    console.log("Key2 JSON:", JSON.stringify(ZIPPYSHARE_KEY2));

    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}authorize`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("JSON Auth response:", response.data);

    if (response.data._status === "success" && response.data.data?.access_token && response.data.data?.account_id) {
      return {
        accessToken: response.data.data.access_token,
        accountId: response.data.data.account_id,
      };
    } else {
      throw new Error(`Authentication failed: ${response.data.response || "Invalid response"}`);
    }
  } catch (error: unknown) {
    const err = error as { response?: { data: AuthResponse }; message?: string };
    console.error("JSON auth error:", err.response?.data || err.message);
    throw new Error("Unable to authenticate with Zippyshare (JSON): " + (err.response?.data?.response || err.message || "Network error"));
  }
};

// Function to authenticate with Zippyshare using FormData
export const getZippyshareAuthForm = async (): Promise<{ accessToken: string; accountId: string }> => {
  try {
    console.log("Testing FormData method");
    const form = new FormData();
    form.append("key1", ZIPPYSHARE_KEY1);
    form.append("key2", ZIPPYSHARE_KEY2);

    console.log("Request URL:", `${API_BASE_URL}authorize`);
    console.log("FormData key1 length:", ZIPPYSHARE_KEY1.length);
    console.log("FormData key2 length:", ZIPPYSHARE_KEY2.length);
    console.log("FormData key1 JSON:", JSON.stringify(ZIPPYSHARE_KEY1)); // Check for hidden characters
    console.log("FormData key2 JSON:", JSON.stringify(ZIPPYSHARE_KEY2));

    const response = await axios.post<AuthResponse>(
      `${API_BASE_URL}authorize`,
      form,
      {
        headers: {
          ...form.getHeaders(), // Sets multipart/form-data with boundary
        },
      }
    );

    console.log("FormData Auth response:", response.data);

    if (response.data._status === "success" && response.data.data?.access_token && response.data.data?.account_id) {
      return {
        accessToken: response.data.data.access_token,
        accountId: response.data.data.account_id,
      };
    } else {
      throw new Error(`Authentication failed: ${response.data.response || "Invalid response"}`);
    }
  } catch (error: unknown) {
    const err = error as { response?: { data: AuthResponse }; message?: string };
    console.error("FormData auth error:", err.response?.data || err.message);
    throw new Error("Unable to authenticate with Zippyshare (FormData): " + (err.response?.data?.response || err.message || "Network error"));
  }
};

// Run both authentication methods sequentially
const runAuth = async () => {
  console.log("Starting authentication tests...");

  // Test JSON method
  try {
    const jsonResult = await getZippyshareAuthJSON();
    console.log("JSON Authentication successful!");
    console.log("Access Token (JSON):", jsonResult.accessToken);
    console.log("Account ID (JSON):", jsonResult.accountId);
  } catch (jsonError) {
    console.error("JSON Authentication failed:", (jsonError as Error).message);
  }

  console.log("\n--- Switching to FormData test ---\n");

  // Test FormData method
  try {
    const formResult = await getZippyshareAuthForm();
    console.log("FormData Authentication successful!");
    console.log("Access Token (FormData):", formResult.accessToken);
    console.log("Account ID (FormData):", formResult.accountId);
  } catch (formError) {
    console.error("FormData Authentication failed:", (formError as Error).message);
  }
};

// Execute the function
runAuth();