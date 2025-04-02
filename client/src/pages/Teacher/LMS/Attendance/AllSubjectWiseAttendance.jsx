import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import api from '../../../../api';
import LoadingButton from '../../../../components/Loading/Loading';
import { FaCalendarAlt, FaDownload, FaSave, FaUserCheck, FaUserTimes, FaChalkboardTeacher, FaSpinner, FaHistory } from 'react-icons/fa';

const AllSubjectWiseAttendance = ({ uid }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [timeSlot, setTimeSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [existingAttendance, setExistingAttendance] = useState(null);
  const [allDates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/lmsclassroom/attendance/getDates/${selectedClassroom.classroom_id}`);
        const datesData = Array.isArray(response.data) ? response.data : [response.data];
        setDates(datesData);
      } catch (error) {
        toast.error('Error fetching attendance dates.');
      } finally {
        setLoading(false);
      }
    };

    if (selectedClassroom) {
      fetchClassrooms();
    }
  }, [selectedClassroom]);

  const uniqueAcademicYears = Array.from(new Set(classrooms.map((classroom) => classroom.academic_year)));

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

  const handleAcademicYearChange = (year) => {
    setExistingAttendance(null);
    setSelectedAcademicYear(year);
    setSelectedClassroom(null);
    setFilteredClassrooms(classrooms.filter((classroom) => classroom.academic_year === year));
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

  const showAttendance = async (e) => {
    let a = String(e.target.selectedOptions[0].text).split(' Time ')
    setSelectedDate(a[0])
    setTimeSlot(a[1])
    setLoading(true);
    try {
      const response = await api.get(`/api/lmsclassroom/attendance/getattendance/${e.target.value}`);

      if (response.data.exists) {
        setExistingAttendance(response.data.attendanceStudents);
        toast.info('Viewing existing attendance record.');
      } else {
        setExistingAttendance(response.data.attendanceStudents);
        toast.success('Attendance sheet loaded successfully.');
      }
    } catch (error) {
      toast.error('Failed to fetch attendance data.');
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
            <FaHistory className="text-blue-600 text-5xl mr-3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl text-blue-700 font-bold">
              Past Attendance Records
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage attendance records for previous classes
          </p>
        </div>

        {/* Selection Form */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
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

              {/* Available Dates */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-blue-500" />
                    Select Date from Available Records
                  </div>
                </label>
                <select
                  onChange={(e) => showAttendance(e)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedClassroom}
                >
                  <option value="" disabled selected>
                    {allDates.length > 0 ? 'Select a date' : 'No dates available'}
                  </option>
                  {allDates.map((e, index) => (
                    <option key={index} value={e.attendance_id}>
                      {e.attendance_date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <FaSpinner className="animate-spin text-blue-600 text-3xl" />
          </div>
        )}

        {/* Attendance Data */}
        {!loading && selectedClassroom && existingAttendance && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            {/* Attendance Info */}
            <div className="bg-blue-50 p-4 border-b border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">
                    {selectedClassroom.room_name}
                  </h3>
                  <p className="text-sm text-blue-600">
                    {selectedDate} • {timeSlot}
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center">
                  <span className="text-sm font-medium text-blue-700 mr-2">Attendance Rate:</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                    stats.percentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.percentage}%
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 p-4 border-t border-b border-gray-200">
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
                                className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200 ml-auto"
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
                                    Update Attendance
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };
                
                export default AllSubjectWiseAttendance;