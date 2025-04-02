import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // For Excel functionality
import api from "../../api";
import Pagination from "../Pagination/Pagination";
import SearchBar from "../Searchbar/Searchbar";
import ExportImportButtons from "../ExportImportButtons/ExportImportButtons";
import MarksTable from "../MarksTable/MarksTable";
import SimpleMarksTable from "../SimpleMarksTable/SimpleMarksTable";
import CalculateAttainment from "../CalculateAttainment/CalculateAttainment";
import LoadingButton from "../Loading/Loading";
const excludedCurriculumIds = [3, 16, 18];

const DisplayMarks = ({ userCourseId, selectedCurriculumId ,uid}) => {
  const [questions, setQuestions] = useState([]);
  const [marksData, setMarksData] = useState([]);
  const [cosdata, SetCosData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchMarks = async () => {
      setUploading(true);
      try {
        const response = await api.get("/api/termwork/get-student-marks", {
          params: {
            userCourseId,
            selectedCurriculumId,
          },
        });
        const response2 = await api.get("/api/termwork/get-questions-cos", {
          params: { userCourseId, selectedCurriculumId },
        });

        const response3 = await api.get(
          "/api/termwork/get-questions-withoutcos",
          {
            params: { userCourseId, selectedCurriculumId },
          }
        );

        // Check if data exists in the response
        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          if (
            response.data[0].Message ==
            "No data found for the specified parameters."
          ) {
            setMarksData([]);
            setFilteredData([]);
            setError("No data found for the specified parameters.");
          } else {
            setMarksData(response.data);
            setFilteredData(response.data);
            setError(null);
          }
        } else {
          setMarksData(null); // Ensure no table is displayed
          setFilteredData([]);
          setError("No data found.");
        }

        if (response2.data && Array.isArray(response2.data)) {
          SetCosData(response2.data);
        } else {
          SetCosData([]);
          console.warn("No Questions and COs data found.");
        }

        if (response3.data && Array.isArray(response3.data)) {
          setQuestions(response3.data);
        } else {
          console.warn("No questions without COs data found.");
          setQuestions([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMarksData(null); // Ensure no table is displayed
        setQuestions([]);
        setFilteredData([]);
        setError("An error occurred while fetching data.");
      } finally {
        setUploading(false); // Stop loading
      }
    };

    if (userCourseId && selectedCurriculumId) {
      setMarksData(null);
      setFilteredData([]);
      setError(null);
      fetchMarks();
    }
  }, [userCourseId, selectedCurriculumId]);

  // console.log(marksData);
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = marksData.filter((row, index) =>
      Object.values({
        index: index + 1,
        ...row,
      })
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleExportToExcel = () => {
    setUploading(true);
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Student Marks");
    XLSX.writeFile(wb, "student_marks.xlsx");
    setUploading(false)
  };
  const handleImportFromExcel = async (file) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const errors = [];
      const updates = [];

      // Determine the data source based on selectedCurriculumId
      const dataSource = excludedCurriculumIds.includes(selectedCurriculumId)
        ? questions
        : transformedData;

      // Validate and prepare updates
      sheetData.forEach((student, rowIndex) => {
        dataSource.forEach((question) => {
          const studentMark = student[question.qname];
            
          if (studentMark !== undefined && studentMark !== null && studentMark.toString().trim() !== "")  {
            if (studentMark > question.qmarks) {
              errors.push(
                `Row ${rowIndex + 2}: Student ${student.student_name} (${
                  student.sid
                }) - Marks for ${question.qname} exceed maximum (${
                  question.qmarks
                }).`
              );
            }else if (studentMark == "" ||studentMark == null) {
              errors.push(
                `Row ${rowIndex + 2}: Student ${student.student_name} (${
                  student.sid
                }) - Marks for ${question.qname} has Null value).`
              );
            } else if ((studentMark.toString().toUpperCase() !== "N" && studentMark.toString().toUpperCase() !== "A") && (isNaN(Number(studentMark)) || Number(studentMark) < 0 || Number(studentMark) > question.qmarks)) {
              errors.push(
                `Row ${rowIndex + 2}: Student ${student.student_name} (${
                  student.sid
                }) - Marks for ${question.qname} has Not  valid).`
              );
            } else {
              updates.push({
                idquestion: question.idquestion_main,
                sid: student.sid,
                marks: studentMark.toString().toUpperCase(),
                t_id:uid
              });
            }
          }
        });
      });

      if (errors.length > 0) {
        alert("Errors found:\n" + errors.join("\n"));
        console.error("Validation Errors:", errors);
        return;
      }

      // Proceed with upload if no errors
      try {
        await bulkUploadUpdates(updates);
      } catch (error) {
        console.error("Error updating marks:", error);
      } finally {
        setUploading(false); // Stop loading
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const bulkUploadUpdates = async (updates) => {
    console.log(updates);

    try {
      setUploading(true)
      const response = await api.post("/api/termwork/importexcelmarks", {
        updates,
        t_id:uid
      });
      setUploading(false);
      if (response.status === 200) {
        setUploading(false);
        alert("Marks successfully updated!");
        window.location.reload();
      } else {
        console.error("Failed to upload updates", response.data);
        alert("Failed to upload marks. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading marks:", error);
      alert(
        "An error occurred while uploading marks. Please check the console for details."
      );
    } finally {
      setUploading(false);
    }
  };

  const transformedData = Object.values(
    cosdata.reduce((acc, item) => {
      const { idquestion_main, qname, qmarks, maxmarks, coname } = item;
      if (!acc[idquestion_main]) {
        acc[idquestion_main] = {
          idquestion_main,
          qname,
          qmarks,
          maxmarks,
          coname: [],
        };
      }
      if (!acc[idquestion_main].coname.includes(coname)) {
        acc[idquestion_main].coname.push(coname);
      }
      return acc;
    }, {})
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const onSaveMarks = async (updatedRow) => {
    console.log("Save API call for:", updatedRow);

    try {
      setUploading(true);
      const response = await api.post("/api/termwork/saveMarks-singlerow", {
        updatedRow,
      });
      console.log(response);
      if (response.status === 200) {
        alert("Marks saved successfully");

        // Update marksData and filteredData state
        setMarksData((prevData) =>
          prevData.map((row) =>
            row.sid === updatedRow.sid
              ? {
                  ...row,
                  ...updatedRow.marksWithQuestionId.reduce(
                    (acc, { key, marks }) => {
                      acc[key] = marks; // Update the specific keys with new marks
                      return acc;
                    },
                    {}
                  ),
                }
              : row
          )
        );

        setFilteredData((prevFiltered) =>
          prevFiltered.map((row) =>
            row.sid === updatedRow.sid
              ? {
                  ...row,
                  ...updatedRow.marksWithQuestionId.reduce(
                    (acc, { key, marks }) => {
                      acc[key] = marks; // Update the specific keys with new marks
                      return acc;
                    },
                    {}
                  ),
                }
              : row
          )
        );
      }else if(response.status == 400 || response.data.error){
        setError(response.data.error);
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      setError(error.response?.data?.error || error.message || "An unknown error occurred"||error);
    } finally {
      setUploading(false); // Stop loading
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Student Marks</h1>
      {marksData === null ? (
        <div className="text-center text-gray-500">Loading data...</div>
      ) : error ? (
        <div className="text-red-500 text-center text-lg">{error}</div>
      ) : (
        <>
          <SearchBar value={searchQuery} onChange={handleSearch} />
          {uploading ? (
            <div className="flex justify-center space-x-4 mb-4" >
              <LoadingButton />
            </div>
           
          ) : (
            <ExportImportButtons
              onExport={handleExportToExcel}
              onImport={handleImportFromExcel}
            />
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          {excludedCurriculumIds.includes(selectedCurriculumId) ? (
            <SimpleMarksTable
              questions={questions}
              data={paginatedData}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onSaveMarks={onSaveMarks}
              uid={uid}
            />
          ) : (
            <MarksTable
              transformedData={transformedData}
              cosdata={cosdata}
              data={paginatedData}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onEdit={(sid) => console.log(`Edit marks for SID: ${sid}`)}
              onSaveMarks={onSaveMarks}
              uid={uid}
            />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <CalculateAttainment
            data={marksData}
            transformedData={transformedData}
            questions={questions}
            selectedCurriculumId={selectedCurriculumId}
            userCourseId={userCourseId}
            excludedCurriculumIds={excludedCurriculumIds}
          />
        </>
      )}
    </div>
  );
};

export default DisplayMarks;
