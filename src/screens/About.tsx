import React, { useContext, useState } from "react";
import Navbar from "../common/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faHeart, faPhone } from "@fortawesome/free-solid-svg-icons";
import profileImage from "/profilePic.jpg";
import { AuthContext, removeStudentInfoFromIndexedDB, removeAuthTokenFromCookie } from "../context/AuthContext";

const About: React.FC = () => {
  const { handleLogoutLocally } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await removeStudentInfoFromIndexedDB();
    removeAuthTokenFromCookie();
    setTimeout(() => {
      setIsLoading(false);
      handleLogoutLocally();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen font-primary max-w-[540px] mx-auto">
      <Navbar />
      <div className="h-20"></div>

      <h1 className="text-4xl font-bold text-center mb-4 px-2">NoticeEase</h1>

      <div className="border-b my-6 mx-2" />

      <p className="text-justify px-3">
        NoticeEase is a user-friendly mobile app designed to simplify your college life. NoticeEase seamlessly
        integrates with IIT KGP's ERP system, providing you with instant access to all the notices and updates you need.
        No more hassles of logging in repeatedly – just open NoticeEase and stay informed. You will have all the notices
        at your finger tips even when you are offline
      </p>

      <div className="border-b my-6 mx-2" />

      {/* Contact Details */}
      <p className="text-center">For any queries and issues with this app, please contact this guy:</p>

      {/* Contact Card */}
      <div className="flex items-center justify-center mx-1 mt-4 mb-2">
        <div className="flex items-center bg-white rounded-lg shadow-lg p-4">
          <img src={profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover mr-4" />
          <div>
            <p className="font-bold">Nikhil Masigari</p>
            <p className="text-sm">19ME31019</p>
            <p className="text-sm flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              nikhil.masigari@gmail.com
            </p>
            <p className="text-sm flex items-center">
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              +91 8247471047
            </p>
          </div>
        </div>
      </div>
      <div className="text-center" onClick={handleLogout}>
        <button className="mx-auto bg-red-500 text-white py-2 px-4 rounded mt-4" disabled={isLoading}>
          {isLoading ? (
            <div className="animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-white"></div>
          ) : (
            <>Logout</>
          )}
        </button>
      </div>
      <p className="text-center my-4 mt-auto">
        Made with <FontAwesomeIcon icon={faHeart} className="text-red-500" /> by Nikhil
      </p>
    </div>
  );
};

export default About;
