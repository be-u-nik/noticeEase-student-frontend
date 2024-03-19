import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faFilter, faTimes, faHamburger } from "@fortawesome/free-solid-svg-icons";
import NoticeCard, { Notice } from "../common/NoticeCard";
import { getNoticesFromIndexedDB, storeNoticesInIndexedDB } from "../context/AuthContext";
import { fetchNotices } from "../utils/asyncNoticeUtils";
import Navbar from "../common/Navbar";
import { ErrorToast, SuccessToast, showToastError, showToastSuccess } from "../common/ToastContainers";
import FilterPopup from "../common/FilterPopup";

const Notices: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showFilterPopup, setShowFilterPopup] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(false);

  const handleFilterApply = async (filters: any) => {
    const notices = await getNoticesFromIndexedDB();
    notices.reverse();
    const filteredNotices = notices.filter((notice) => {
      const typeFilterPassed =
        (!filters.typeFilters.PLACEMENT && !filters.typeFilters.INTERNSHIP) ||
        (filters.typeFilters.PLACEMENT && notice.type === "PLACEMENT") ||
        (filters.typeFilters.INTERNSHIP && notice.type === "INTERNSHIP");

      const noSubjectSelected = Object.values(filters.subjectFilters).some((selected) => selected);

      var subjectFilterPassed: boolean = !noSubjectSelected;
      Object.keys(filters.subjectFilters).every((subject) => {
        if (filters.subjectFilters[subject] && notice.subject === subject) {
          subjectFilterPassed = true;
          return false;
        } else return true;
      });
      return typeFilterPassed && subjectFilterPassed;
    });

    setNotices(filteredNotices);
    setShowFilterPopup(false);
    setShowFilterPopup(false);
  };

  const toggleButtons = () => {
    setShowButtons(!showButtons);
  };

  // React Query
  const localDataMutation = useMutation(getNoticesFromIndexedDB, {
    onSuccess: (data) => {
      data.reverse();
      setNotices(data);
      showToastSuccess("Notices updated");
      const storedScrollPosition = sessionStorage.getItem("scrollPosition");
      window.scrollTo(0, Number(storedScrollPosition));
      setTimeout(() => {
        setIsRefreshing(false);
        sessionStorage.removeItem("scrollPosition");
      }, 1000);
    },
    onError: (error: Error) => {
      setTimeout(() => {
        setIsRefreshing(false);
        console.log(error);
        showToastError("Notices Fetch Failed");
      }, 1000);
      //   showToastError(error.message);
    },
  });

  const remoteDataMutation = useMutation(() => fetchNotices(), {
    onSuccess: async (data) => {
      await storeNoticesInIndexedDB(data);
      localDataMutation.mutate();
    },
    onError: (error: Error) => {
      setIsRefreshing(false);
      showToastError(error.message);
    },
  });

  // Function to handle refresh action
  const handleRefresh = async () => {
    setShowButtons(false);
    setIsRefreshing(true);
    remoteDataMutation.mutate();
  };

  useEffect(() => {
    setIsRefreshing(true);
    localDataMutation.mutate();
    remoteDataMutation.mutate();
    return () => {};
  }, []);

  return (
    <div className="bg-gray-100/[0.3] font-primary max-w-[540px] mx-auto">
      <SuccessToast />
      <ErrorToast />
      <Navbar />
      <div className="h-20"></div>

      {isRefreshing && (
        <div className="mb-1 animate-spin mx-auto rounded-full h-6 w-6 border-t-2 border-r-2 border-black"></div>
      )}
      {/* Render the notices */}
      {notices?.map((notice) => (
        <NoticeCard key={notice._id} notice={notice} />
      ))}
      {!notices && <div>No notices</div>}
      {/* Render the refresh button */}
      <div
        className="fixed bottom-4 right-4 h-12 w-12 flex justify-center items-center bg-gray-500 text-white rounded-full shadow-lg cursor-pointer"
        onClick={toggleButtons}
      >
        <FontAwesomeIcon icon={showButtons ? faTimes : faHamburger} />
      </div>
      {showButtons && (
        <div className="fixed bottom-20 right-4 flex flex-col space-y-2">
          <div
            className="h-12 w-12 flex justify-center items-center bg-gray-500 text-white rounded-full shadow-lg cursor-pointer"
            onClick={() => {
              setShowFilterPopup(true);
              setShowButtons(false);
            }}
          >
            <FontAwesomeIcon icon={faFilter} />
          </div>
          <div
            className="h-12 w-12 flex justify-center items-center bg-gray-500 text-white rounded-full shadow-lg cursor-pointer"
            onClick={handleRefresh}
          >
            <FontAwesomeIcon icon={faSync} className={isRefreshing ? "animate-spin" : ""} />
          </div>
        </div>
      )}
      {showFilterPopup && <FilterPopup onClose={() => setShowFilterPopup(false)} onApply={handleFilterApply} />}
    </div>
  );
};

export default Notices;
