import axios from "axios";
import BASE_URL from "../../config";


export const fetchDataFromServer = async (endpoint,token) => {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Gagal mengambil data dari ${endpoint}:`, error);
    return [];
  }
};

export const sendUnsyncedData = async ({data, table,token}) => {
  try {
    const response = await axios.post(`${BASE_URL}/sync-${table}`, { [table]: data });
    return response.data.success;
  } catch (error) {
    console.error(`❌ Gagal mengirim data ${table}:`, error);
    return false;
  }
};
