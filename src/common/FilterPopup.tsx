import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faFilter } from "@fortawesome/free-solid-svg-icons";

interface FilterPopupProps {
  onClose: () => void;
  onApply: (filters: any) => void;
}
type SubjectFilters = {
  [key: string]: boolean;
};

const FilterPopup: React.FC<FilterPopupProps> = ({ onClose, onApply }) => {
  const [typeFilters, setTypeFilters] = useState({
    PLACEMENT: false,
    INTERNSHIP: false,
  });

  const [subjectFilters, setSubjectFilters] = useState<SubjectFilters>({
    Urgent: false,
    Shortlist: false,
    "CV Submission": false,
    "PPT/Workshop/Seminars etc": false,
    PPO: false,
  });

  const handleApply = () => {
    onApply({ typeFilters, subjectFilters });
    onClose();
  };

  const handleTypeFilterChange = (selectedType: keyof typeof typeFilters) => {
    setTypeFilters({ ...typeFilters, PLACEMENT: false, INTERNSHIP: false, [selectedType]: true });
  };

  const handleSubjectFilterChange = (selectedSubject: keyof typeof subjectFilters) => {
    const newSubjectFilters = { ...subjectFilters };
    Object.keys(newSubjectFilters).forEach((subject) => {
      newSubjectFilters[subject] = subject === selectedSubject;
    });
    setSubjectFilters(newSubjectFilters);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-96 mx-2">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Filter</h2>
          <button className="bg-red-500 text-white py-2 px-4 rounded-md" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Close
          </button>
        </div>
        <div className="ml-0 mt-4">
          <div className="flex items-center space-x-2 mb-2">
            <label className="flex items-center w-full">
              <input
                className="w-[10%] m-0"
                type="checkbox"
                checked={typeFilters.PLACEMENT}
                onChange={() => handleTypeFilterChange("PLACEMENT")}
              />
              PLACEMENT
            </label>
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <label className="flex items-center w-full">
              <input
                className="w-[10%] m-0"
                type="checkbox"
                checked={typeFilters.INTERNSHIP}
                onChange={() => handleTypeFilterChange("INTERNSHIP")}
              />
              INTERNSHIP
            </label>
          </div>
        </div>
        <div className="">
          {Object.keys(subjectFilters).map((subject) => (
            <div key={subject} className="flex items-center space-x-2 mb-2">
              <label className="flex items-center w-full">
                <input
                  className="w-[10%] m-0"
                  type="checkbox"
                  checked={subjectFilters[subject]}
                  onChange={() => handleSubjectFilterChange(subject)}
                />
                {subject}
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button className="bg-blue-500 text-white py-2 px-4 rounded-md" onClick={handleApply}>
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
