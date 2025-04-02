import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../api";
import { backend_url as backendUrl } from "../../../api.js";
import { FaUser, FaSave, FaSpinner, FaUpload } from "react-icons/fa";

const StudentProfile = (id) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [profileData, setProfileData] = useState({
    dateOfBirth: "",
    gender: "",
    currentAddress: "",
    permanentAddress: "",
    mobileNo: "",
    emailId: "",
    fatherName: "",
    fatherMobile: "",
    fatherEmail: "",
    motherName: "",
    motherMobile: "",
    motherEmail: "",
    facultyMentor: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

  const sid = id.sid;
  console.log(sid)
  useEffect(() => {
    if (!sid) {
      navigate("/");
      return;
    }

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // Fetch basic student details
        const detailsResponse = await api.get(`/api/student/profile/details/${sid}`);
        console.log(detailsResponse)
        setStudentData(detailsResponse.data);

        // Fetch profile data if exists
        const profileResponse = await api.get(`/api/student/profile/${sid}`);

        if (profileResponse.data.exists) {
          const profile = profileResponse.data.profile;
          setProfileData({
            dateOfBirth: profile.date_of_birth ? profile.date_of_birth.split("T")[0] : "",
            gender: profile.gender || "",
            currentAddress: profile.current_address || "",
            permanentAddress: profile.permanent_address || "",
            mobileNo: profile.mobile_no || "",
            emailId: profile.email_id || detailsResponse.data.email || "",
            fatherName: profile.father_name || "",
            fatherMobile: profile.father_mobile || "",
            fatherEmail: profile.father_email || "",
            motherName: profile.mother_name || "",
            motherMobile: profile.mother_mobile || "",
            motherEmail: profile.mother_email || "",
            facultyMentor: profile.faculty_mentor || (detailsResponse.data.mentor ? detailsResponse.data.mentor.mentor_name : "")
          });

          if (profile.profile_image) {
            setPreviewImage(`${backendUrl}${profile.profile_image}`);
          }
        } else if (detailsResponse.data.email) {
          setProfileData((prev) => ({
            ...prev,
            emailId: detailsResponse.data.email,
            facultyMentor: detailsResponse.data.mentor ? detailsResponse.data.mentor.mentor_name : ""
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [sid, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));

    // If "Same as Current Address" is checked, update permanent address
    if (sameAsCurrentAddress && name === "currentAddress") {
      setProfileData((prev) => ({
        ...prev,
        permanentAddress: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { checked } = e.target;
    setSameAsCurrentAddress(checked);

    if (checked) {
      setProfileData((prev) => ({
        ...prev,
        permanentAddress: profileData.currentAddress
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      // Append all profile data to formData
      Object.keys(profileData).forEach((key) => {
        formData.append(key, profileData[key]);
      });

      await api.post(`/api/student/profile/${sid}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setSaving(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaving(false);
      alert("Error updating profile. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Student Profile</h1>

          {studentData && (
            <div className="mb-6 flex flex-col md:flex-row items-center md:items-start">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <FaUser className="text-blue-600 text-4xl" />
                )}
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-semibold text-gray-800">{studentData.student_name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    ID: {studentData.stud_clg_id}
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {studentData.academic_year}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Profile Image Upload */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Profile Image</h3>
                <div className="flex items-center">
                  <label className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer transition-colors duration-200">
                    <FaUpload className="mr-2" />
                    Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <span className="ml-3 text-sm text-gray-500">
                    {profileImage ? profileImage.name : "No file selected"}
                  </span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      name="mobileNo"
                      value={profileData.mobileNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                    <input
                      type="email"
                      name="emailId"
                      value={profileData.emailId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Address Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                    <textarea
                      name="currentAddress"
                      value={profileData.currentAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current address"
                    ></textarea>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={sameAsCurrentAddress}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAddress" className="ml-2 block text-sm text-gray-700">
                      Permanent address same as current address
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                    <textarea
                      name="permanentAddress"
                      value={profileData.permanentAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter permanent address"
                      disabled={sameAsCurrentAddress}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Parent Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Father's Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="fatherName"
                          value={profileData.fatherName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter father's name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                          type="text"
                          name="fatherMobile"
                          value={profileData.fatherMobile}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter father's mobile number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="fatherEmail"
                          value={profileData.fatherEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter father's email"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-600 mb-2">Mother's Details</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          name="motherName"
                          value={profileData.motherName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Mothers's name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                          type="text"
                          name="motherMobile"
                          value={profileData.motherMobile}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Mothers's mobile number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="motherEmail"
                          value={profileData.motherEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Mothers's email"
                        />
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
