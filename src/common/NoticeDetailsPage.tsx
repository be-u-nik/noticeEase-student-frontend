import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const NoticeDetailsPage: React.FC = () => {
  const location = useLocation();
  const selectedNotice = location.state;
  const navigate = useNavigate();
  const isForward = location.state && location.state.isForward;
  const [isLoading, setisLoading] = useState<boolean>(false);

  const handleDownloadAttachment = () => {
    setisLoading(true);
    if (selectedNotice.fileBuffer && selectedNotice.fileBuffer.data) {
      const fileData = new Uint8Array(selectedNotice.fileBuffer.data);
      const blob = new Blob([fileData], { type: selectedNotice.fileBuffer.type });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "attachment.pdf"; // Replace with the desired filename and its extension
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the URL object
      URL.revokeObjectURL(url);
    }
    setTimeout(() => {
      setisLoading(false);
    }, 1000);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div
      className={`${
        isForward ? "animate-slideFromLeft" : "" // Apply the animation based on the direction
      }`}
    >
      {/* Back Arrow */}
      <div
        onClick={handleGoBack}
        className="cursor-pointer fixed text-xl p-4 py-4 mb-2 border-b bg-white w-full rounded-b-xl"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back
      </div>

      {/* HTML Content */}
      {selectedNotice && (
        <div
          className="pt-16 pb-16 px-4"
          style={{ wordBreak: "break-all" }}
          dangerouslySetInnerHTML={{ __html: selectedNotice.htmlContent }}
        />
      )}

      {/* Download Button */}
      {selectedNotice?.fileBuffer && (
        <div
          onClick={handleDownloadAttachment}
          className="text-sm fixed bottom-4 right-4 p-3 bg-gray-500 text-white rounded-lg shadow-lg cursor-pointer"
        >
          {isLoading ? (
            <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} />
              <span className="ml-2">Download Attachment</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NoticeDetailsPage;
