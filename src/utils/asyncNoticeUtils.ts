import { Notice } from "../common/NoticeCard";
import { getNoticesLengthFromIndexedDB } from "../context/AuthContext";

export async function fetchNotices(): Promise<Notice[]> {
  try {
    const skip = await getNoticesLengthFromIndexedDB();
    const response = await fetch(
      `${import.meta.env.VITE_ERPSCRAPPER_BASE_URL}/api/notices/getErpNotices?skip=${skip}&limit=100`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch notices from the server");
    }
    const data = await response.json();
    return data.notices;
  } catch (error) {
    throw new Error("Fetch Error");
  }
}
