import React from "react";
import { useNavigate } from "react-router-dom";
import { markNoticeAsRead } from "../context/AuthContext";

export interface Notice {
  _id: string;
  sno: number;
  id: number;
  customSno: number;
  type: string;
  subject: string;
  company: string;
  notice: string;
  noticeTime: string;
  htmlContent: string;
  fileBuffer: {
    type: string;
    data: number[];
  };
  isRead: boolean;
}

interface NoticeCardProps {
  notice: Notice;
}

const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const navigate = useNavigate();

  const getColorByType = () => {
    if (notice.type === "INTERNSHIP") return "green-500";
    if (notice.type === "PLACEMENT") return "red-500";
    return "blue";
  };

  const getColorBySubject = () => {
    if (notice.subject.toLowerCase() === "urgent") return "red-500";
    if (
      notice.subject.toLowerCase().includes("ppt") ||
      notice.subject.toLowerCase().includes("workshop") ||
      notice.subject.toLowerCase().includes("seminars")
    )
      return "[#9c27b0]";
    return "blue-500";
  };

  const getFormattedDate = () => {
    const date = new Date(notice.noticeTime);
    const dateArray = date
      .toLocaleString("default", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
      .split(",")
      .join("")
      .split(" ");

    return { date: `${dateArray[0]} ${dateArray[1]}, ${dateArray[2]}`, time: `${dateArray[3]} ${dateArray[4]}` };
  };

  const typeColor = getColorByType();
  const subjectColor = "text-" + getColorBySubject();
  const formattedDateTime = getFormattedDate();

  const handleCardClick = async () => {
    // Mark the notice as read before navigating to the dynamic page
    sessionStorage.setItem("scrollPosition", window.scrollY.toString());
    if (!notice.isRead) {
      await markNoticeAsRead(notice._id);
    }
    navigate(`/notices/${notice._id}`, {
      state: {
        htmlContent: notice.htmlContent,
        fileBuffer: notice.fileBuffer,
        isForward: true,
      },
    });
  };

  return (
    <div
      className={`rounded-lg shadow p-4 mb-4 mx-2 cursor-pointer ${!notice.isRead ? "bg-white" : "bg-[#dfdede]"}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-3xl font-bold text-black">#{notice.customSno}</span>
        <div className={`rounded-lg shadow px-2 py-1 text-white bg-${typeColor}`}>{notice.type}</div>
      </div>
      <h2 className={`text-xl font-semibold ${subjectColor}`}>{notice.subject}</h2>
      <p className="text-gray-500 line-clamp-4">{notice.notice}</p>
      <div className="flex justify-between items-center mt-4 text-gray-500">
        <div className="truncate">
          company: <br />
          {notice.company}
        </div>
        <div className="text-right w-full">
          <span>{formattedDateTime.date}</span>
          <br />
          {formattedDateTime.time && <span>{formattedDateTime.time}</span>}
        </div>
      </div>
    </div>
  );
};

export default NoticeCard;
