import axios from "axios";

const API_URL = "https://example.com/api";

export const fetchDataFromServer = async (endpoint) => {
  try {
    const response = await axios.get(`${API_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Gagal mengambil data dari ${endpoint}:`, error);
    return [];
  }
};

export const sendUnsyncedData = async (data, table) => {
  try {
    const response = await axios.post(`${API_URL}/sync-${table}`, { [table]: data });
    return response.data.success;
  } catch (error) {
    console.error(`❌ Gagal mengirim data ${table}:`, error);
    return false;
  }
};
