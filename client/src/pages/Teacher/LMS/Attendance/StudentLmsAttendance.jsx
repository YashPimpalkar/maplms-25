import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import api from '../../../../api';
import LoadingButton from '../../../../components/Loading/Loading';
import { FaCalendarAlt, FaDownload, FaSave, FaUserCheck, FaUserTimes, FaClock, FaChalkboardTeacher, FaSpinner } from 'react-icons/fa';

const StudentLmsAttendance = ({ uid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/lmsclassroom/show/${uid}`);
        const classroomData = Array.isArray(response.data) ? response.data : [response.data];
        setClassrooms(classroomData);
      } catch (error) {
        toast.error('Error fetching classrooms.');
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchClassrooms();
    }
  }, [uid]);

  const uniqueAcademicYears = Array.from(new Set(classrooms.map((classroom) => classroom.academic_year)));

  const handleAcademicYearChange = (year) => {
    setExistingAttendance(null);
    setSelectedAcademicYear(year);
    setSelectedClassroom(null);
    setFilteredClassrooms(classrooms.filter((classroom) => classroom.academic_year === year));
  };

  const handleClassroomChange = (classroomId) => {
    setExistingAttendance(null);
    const selected = classrooms.find((classroom) => classroom.classroom_id === parseInt(classroomId, 10));
    setSelectedClassroom(selected);
  };

  const handleDateChange = (date) => {
    setExistingAttendance(null);
    setSelectedDate(date);
  };

  const handleTimeSlotChange = (slot) => {
    setExistingAttendance(null);
    setTimeSlot(slot);
  };

  const handleAttendanceChange = (studentId, status) => {
    setExistingAttendance((prev) =>
      prev.map((student) =>
        student.att_stud_id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSelectAllPresent = () => {
    const updatedAttendance = existingAttendance.map((student) => ({
      ...student,
      status: 1, // Set all to "Present"
    }));
    setExistingAttendance(updatedAttendance);
    toast.success('All students marked present');
  };

  const handleSelectAllAbsent = () => {
    const updatedAttendance = existingAttendance.map((student) => ({
      ...student,
      status: 0, // Set all to "Absent"
    }));
    setExistingAttendance(updatedAttendance);
    toast.success('All students marked absent');
  };

  const showAttendance = async () => {
    if (!selectedAcademicYear || !selectedClassroom || !selectedDate || !timeSlot) {
      toast.error('Please select all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/api/lmsclassroom/attendance/getattendance`, {
        class_id: selectedClassroom.classroom_id,
        attendance_date: selectedDate,
        time_slot: timeSlot,
      });

      if (response.data.exists) {
        setExistingAttendance(response.data.attendanceStudents);
        toast.info('Attendance record already exists for this date and time.');
      } else {
        setExistingAttendance(response.data.attendanceStudents);
        toast.success('Attendance sheet created successfully.');
      }
      setFormStep(2);
    } catch (error) {
      toast.error('Failed to create or fetch attendance.');
    } finally {
      setLoading(false);
    }
  };

  const submitAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/api/lmsclassroom/attendance/submitattendance`, existingAttendance);
      if (response.status === 200) {
        toast.success(response.data.message || 'Attendance updated successfully.');
      } else {
        toast.error(response.data.message || 'Failed to update attendance.');
      }
    } catch (error) {
      toast.error('Failed to update attendance.');
    } finally {
      setLoading(false);
    }
  };

  const downloadAttendance = () => {
    let i = 1;

    const headers = [
      { A: `Classroom: ${selectedClassroom ? selectedClassroom.room_name : ''}` },
      { A: `Date: ${selectedDate || ''}` },
      { A: `Time Slot: ${timeSlot || ''}` },
      {}
    ];

    const headerSheet = XLSX.utils.json_to_sheet(headers, { header: ["A"], skipHeader: true });

    XLSX.utils.sheet_add_json(headerSheet,
      existingAttendance.map((student) => ({
        'Sr No': i++,
        'ID No': student.stud_clg_id,
        'Name': student.student_name,
        'Attendance': student.status === 1 ? 'Present' : student.status === 0 ? 'Absent' : 'Not Marked',
      })),
      { origin: -1 }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, headerSheet, 'Attendance');

    XLSX.writeFile(wb, `${selectedClassroom ? selectedClassroom.room_name : ''}-${selectedDate || ''}attendance.xlsx`);
    toast.success('Attendance downloaded successfully.');
  };

  const isAttendanceReady = selectedAcademicYear && selectedClassroom && selectedDate && timeSlot;
  
  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (!existingAttendance) return { present: 0, absent: 0, total: 0, percentage: 0 };
    
    const present = existingAttendance.filter(student => student.status === 1).length;
    const total = existingAttendance.length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, total, percentage };
  };
  
  const stats = getAttendanceStats();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mt-5">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <FaCalendarAlt className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Manage Attendance
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track and manage student attendance for your classes
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          {/* Form Steps */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} mr-2`}>
                1
              </div>
              <div className={`text-sm font-medium ${formStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>Select Class</div>
              
              <div className="flex-grow mx-4 h-0.5 bg-gray-200">
                <div className={`h-0.5 bg-blue-600 transition-all duration-300 ${formStep >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${formStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'} mr-2`}>
                2
              </div>
              <div className={`text-sm font-medium ${formStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>Mark Attendance</div>
            </div>
          </div>

          {formStep === 1 && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      Academic Year
                    </div>
                  </label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => handleAcademicYearChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select Academic Year</option>
                    {uniqueAcademicYears.map((year, index) => (
                      <option key={index} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Classroom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FaChalkboardTeacher className="mr-2 text-blue-500" />
                      Classroom
                    </div>
                  </label>
                  <select
                    value={selectedClassroom ? selectedClassroom.classroom_id : ''}
                    onChange={(e) => handleClassroomChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!selectedAcademicYear}
                  >
                    <option value="" disabled>Select Classroom</option>
                    {filteredClassrooms.map((classroom) => (
                      <option key={classroom.classroom_id} value={classroom.classroom_id}>
                        {classroom.room_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      Date
                    </div>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-blue-500" />
                      Time Slot
                    </div>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => handleTimeSlotChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>Select Time Slot</option>
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="01:00 PM - 02:00 PM">01:00 PM - 02:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Show Attendance Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={showAttendance}
                  disabled={!isAttendanceReady || loading}
                  className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ${
                    !isAttendanceReady || loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Show Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {formStep === 2 && existingAttendance && (
            <div className="p-6">
              {/* Attendance Summary */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 mb-1">Total Students</div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 mb-1">Present</div>
                  <div className="text-2xl font-bold text-green-700">{stats.present}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-600 mb-1">Absent</div>
                  <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 mb-1">Attendance Rate</div>
                  <div className="text-2xl font-bold text-purple-700">{stats.percentage}%</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={handleSelectAllPresent}
                  className="flex items-center bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200"
                >
                  <FaUserCheck className="mr-2" />
                  Mark All Present
                </button>
                <button
                  onClick={handleSelectAllAbsent}
                  className="flex items-center bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200"
                >
                  <FaUserTimes className="mr-2" />
                  Mark All Absent
                </button>
                <button
                  onClick={downloadAttendance}
                  className="flex items-center bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 ml-auto"
                >
                  <FaDownload className="mr-2" />
                  Download Excel
                </button>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID No</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {existingAttendance.map((student, index) => (
                      <tr key={student.att_stud_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.stud_clg_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.student_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center space-x-4">
                            <label className={`flex items-center space-x-2 cursor-pointer ${student.status === 1 ? 'text-green-600' : 'text-gray-500'}`}>
                              <input
                                type="radio"
                                checked={student.status === 1}
                                onChange={() => handleAttendanceChange(student.att_stud_id, 1)}
                                className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
                              />
                              <span>Present</span>
                            </label>
                            <label className={`flex items-center space-x-2 cursor-pointer ${student.status === 0 ? 'text-red-600' : 'text-gray-500'}`}>
                              <input
                                type="radio"
                                checked={student.status === 0}
                                onChange={() => handleAttendanceChange(student.att_stud_id, 0)}
                                className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
                              />
                              <span>Absent</span>
                            </label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={submitAttendanceData}
                  disabled={loading}
                  className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Submit Attendance
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentLmsAttendance;