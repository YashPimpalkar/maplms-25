import React, { useEffect, useState } from "react";
import api from "../../../api";
import CourseSelector from "../../../components/CourseSelector/CourseSelector";
import FilteredCurriculum from "../../../components/FilteredCurriculum/FilteredCurriculum";
import QuestionnaireForm from "../../../components/QuestionnaireForm/QuestionnaireForm";
import { FaCloudUploadAlt, FaBook, FaListAlt, FaSpinner, FaClipboardList } from "react-icons/fa";

const UploadTermworkQuestion = ({ uid }) => {
  const [curriculum, setCurriculum] = useState(null);
  const [termworkTable, setTermworkTable] = useState(null);
  const [filteredCurriculum, setFilteredCurriculum] = useState(null);
  const [selectedTwid, setSelectedTwid] = useState(1);
  const [userCourseId, setUserCourseId] = useState(null);
  const [twdata, setTwData] = useState(null);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (id) => {
    setSelectedCurriculumId(id);
    console.log(`Selected ID: ${id}`);
  };

  useEffect(() => {
    const fetchTermworkData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/termwork/getcurriculum`);
        const response2 = await api.get(`/api/termwork/get-termwork-table`);
        setCurriculum(response.data);
        setTermworkTable(response2.data);
      } catch (error) {
        console.error("Error fetching termwork data:", error);
        setCurriculum(null);
        setTermworkTable(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTermworkData();
  }, []);

  useEffect(() => {
    const fetchTermworkLabels = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/termwork/gettermworkdata/${userCourseId}`
        );
        setTwData(response.data);
        setSelectedTwid(response.data[0]?.twid || 1);
      } catch (error) {
        console.error("Error fetching termwork labels:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userCourseId) {
      fetchTermworkLabels();
    } else {
      setTwData(null);
      setFilteredCurriculum(null);
    }
  }, [userCourseId]);

  useEffect(() => {
    if (userCourseId && curriculum && termworkTable) {
      const selectedTermwork = termworkTable.find(
        (item) => item.twid === selectedTwid
      );
      if (selectedTermwork) {
        const includedIds = [];

        if (selectedTermwork.th_only_id) includedIds.push(1, 2, 3);
        if (selectedTermwork.miniproject) includedIds.push(4);
        if (selectedTermwork.majorproject) includedIds.push(5);
        if (selectedTermwork.assignid) includedIds.push(6);
        if (selectedTermwork.exid) includedIds.push(7);
        if (selectedTermwork.scprid) includedIds.push(8);
        if (selectedTermwork.report_id) includedIds.push(9);
        if (selectedTermwork.ppt_id) includedIds.push(10);
        if (selectedTermwork.oralpce) includedIds.push(11);
        if (selectedTermwork.mini_id) includedIds.push(12);
        if (selectedTermwork.miniproid) includedIds.push(13);
        if (selectedTermwork.journalid) includedIds.push(14);
        if (selectedTermwork.tradeid) includedIds.push(15);
        if (selectedTermwork.oral) includedIds.push(16);
        if (selectedTermwork.attid) includedIds.push(18);

        const filtered = curriculum.filter((item) =>
          includedIds.includes(item.idcurriculum)
        );
        setFilteredCurriculum(filtered);
      }
    } else {
      setFilteredCurriculum(null);
    }
  }, [userCourseId, selectedTwid, curriculum, termworkTable]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto mt-5">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaCloudUploadAlt className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Assessment Questions
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload and manage assessment questions for your courses. Select a course, choose an assessment type, and create your questions.
          </p>
        </div>

        {/* Course Selector Card */}
        <div className="mb-10">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <FaBook className="mr-2" /> Select Course
            </h2>
            <CourseSelector uid={uid} onUserCourseIdChange={setUserCourseId} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          </div>
        )}

        {/* Filtered Curriculum Section */}
        {filteredCurriculum && filteredCurriculum.length > 0 && (
          <div className="mb-10">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <div className="bg-blue-600 text-white py-3 px-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <FaListAlt className="mr-2" /> Assessment Types
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Select an assessment type to create questions for:
                </p>
                <FilteredCurriculum
                  filteredCurriculum={filteredCurriculum}
                  selectedCurriculumId={selectedCurriculumId}
                  onSelect={handleSelect}
                />
              </div>
            </div>
          </div>
        )}

        {/* No Assessment Types Available */}
        {userCourseId && (!filteredCurriculum || filteredCurriculum.length === 0) && !loading && (
          <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200 text-center mb-10">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Types Available</h3>
            <p className="text-gray-500">
              There are no assessment types available for this course. Please select a different course or contact your administrator.
            </p>
          </div>
        )}

        {/* Questionnaire Form */}
        {selectedCurriculumId && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 mb-10">
            <div className="bg-blue-600 text-white py-3 px-6">
              <h2 className="text-xl font-semibold flex items-center">
                <FaClipboardList className="mr-2" /> Create Questions
              </h2>
            </div>
            <div className="p-6">
              <QuestionnaireForm uid={uid} userCourseId={userCourseId} selectedCurriculumId={selectedCurriculumId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadTermworkQuestion;