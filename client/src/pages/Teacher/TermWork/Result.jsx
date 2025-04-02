import React, { useEffect, useState } from "react";
import CourseSelector from "../../../components/CourseSelector/CourseSelector";
import api from "../../../api";
import MainResult from "../../../components/Result/MainResult";

const Result = ({ uid }) => {
  const [userCourseId, setUserCourseId] = useState(null);
  const [selectedTwid, setSelectedTwid] = useState(null);
  const [Termworkdata, setTermworkdata] = useState(null);

  useEffect(() => {
    const fetchTermworkLabels = async () => {
      try {
        const response = await api.get(`/api/termwork/${userCourseId}`);
        setTermworkdata(response.data[0]);
        setSelectedTwid(response.data[0].tw_id);
      } catch (error) {
        console.error("Error fetching termwork labels:", error);
      }
    };

    if (userCourseId) {
      fetchTermworkLabels();
    } else {
      setTermworkdata(null);
      setSelectedTwid(null);
    }
  }, [userCourseId]);
 console.log(selectedTwid)
 console.log(Termworkdata)
 console.log(userCourseId)
  return (
    <div className="left-0 z-45 w-full mt-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-blue-700 text-center font-extrabold flex justify-center mt-10">Result</h1>
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            {/* Course Selector */}
            <CourseSelector uid={uid} onUserCourseIdChange={setUserCourseId} />

            {/* Display Termwork Data */}
          </div>
        </div>
      </div>

      <div>
        {userCourseId && Termworkdata ? (
          <MainResult
            Termworkdata={Termworkdata}
            userCourseId={userCourseId}
            selectedTwid={selectedTwid}
          />
        ) : (
          <p className="text-center text-gray-500 mt-4">
            No data available for the selected course or term work.
          </p>
        )}
      </div>
    </div>
  );
};

export default Result;
