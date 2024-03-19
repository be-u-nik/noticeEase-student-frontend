// src/components/Navbar.tsx

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Navbar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div
          className={`bg-red-500 text-white top-0 left-[50%] transform translate-x-[-50%] rounded-md px-1 z-50 fixed text-center`}
        >
          You are offline
        </div>
      )}

      <div className="fixed w-full flex justify-around bg-gray-100 p-4 rounded-b-2xl shadow mb-2 max-w-[540px] mx-auto">
        {/* Tab 1 - Notifications */}
        <NavLink to="/notices" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white">
          <FontAwesomeIcon icon={faBell} />
          <span className="navItemStyle">Notices</span>{" "}
        </NavLink>

        {/* Tab 3 - About */}
        <NavLink to="/about" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white">
          <FontAwesomeIcon icon={faInfoCircle} />
          <span className="navItemStyle">About</span>
        </NavLink>
      </div>
    </>
  );
};

export default Navbar;
