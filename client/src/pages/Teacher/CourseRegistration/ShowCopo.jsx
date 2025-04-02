import React, { useEffect, useState,useRef } from "react";
import api from "../../../api";
import LoadingButton from "../../../components/Loading/Loading";
import CourseSelector from "../../../components/CourseSelector/CourseSelector";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AiFillFilePdf } from 'react-icons/ai';




const CoposhowComponent = ({ uid }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setUserCourseId] = useState(null);
  const [copo, setCopo] = useState([]);
  const [usercoursedata,SetUserCourseDetails] =useState(null)
  const [loading, setLoading] = useState(false);
  const [cosdata ,setcosData] =useState([])
  const [isEditable, setIsEditable] = useState(false); 
  const [Averages, setAverages] = useState({}); 
  
  const tableRefs = useRef([]);
  const addToRefs = (el) => {
    if (el && !tableRefs.current.includes(el)) {
      tableRefs.current.push(el);
    }
  };

  const generatePDF = async () => {
    const pdf = new jsPDF();
    
    // Header image from public folder
    const collegeHeader = '/images/CollegeHeader.png';
    
    let yPosition = 20; // Initial Y position after the header
  
    // Flag to check if it's the first table
    let isFirstTable = true;
  
    for (const table of tableRefs.current) {
      if (table) {
        // Add header image
        const headerImage = new Image();
        headerImage.src = collegeHeader;
  
        // Wait for the header image to load
        await new Promise((resolve) => {
          headerImage.onload = resolve;
        });
  
        // Add the header image to the PDF
        pdf.addImage(headerImage, 'PNG', 10, 10, 190, 20);
  
        // Check if this is the first table, if so, adjust the position
        if (isFirstTable) {
          yPosition += 30; // Move the first table a bit lower
          isFirstTable = false; // After the first table, don't adjust further
        }
  
        // Capture table as an image
        const canvas = await html2canvas(table);
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
        // Add the table image to the PDF
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 20; // Update yPosition for the next table
  
        // If the content exceeds page height, add a new page
        if (yPosition + imgHeight >= 280) {
          pdf.addPage();
          yPosition = 40; // Reset Y position for the new page
        }
      }
    }
  
    // Save the PDF
    pdf.save('tables.pdf');
  };
  

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/copo/${uid}`);
        setCourses(res.data);
      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchCourseData();
    }
  }, [uid]);

  
  useEffect(() => {
    const fetchCosData = async () => {
      try {
        setLoading(true);
        const res = await api.post(`/api/cos/${selectedCourseId}`);
        setcosData(res.data);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setcosData(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourseId) {
 
      fetchCosData();
    }
  }, [selectedCourseId]);

  console.log(cosdata)

  useEffect(() => {
    const fetchUserCourseData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/usercourse/details/${selectedCourseId}`);
        SetUserCourseDetails(res.data[0]);
      } catch (error) {
        console.error("Error fetching course data:", error);
        SetUserCourseDetails(null)
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourseId) {
      fetchUserCourseData();
    }
  }, [selectedCourseId]);

  console.log(usercoursedata)

  const fetchCopo = async (usercourse) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/copo/show/${usercourse}`);
      setCopo(res.data);
    } catch (error) {
      console.error("Error fetching CO-PO data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (newUserCourseId) => {
    fetchCopo(newUserCourseId);
  };

  const handleChange = (index, field, value) => {
    const updatedCopo = [...copo];
    const intValue = parseInt(value, 10);
    updatedCopo[index][field] =
      intValue >= 1 && intValue <= 3 ? intValue : null;
    setCopo(updatedCopo);
  };

  const handleSave = async (coId) => {
    const item = copo.find((c) => c.co_id === coId);
    try {
      setLoading(true);

    
      
      await api.put(`/api/copo/update/${coId}`, {
        po_1: item.po_1,
        po_2: item.po_2,
        po_3: item.po_3,
        po_4: item.po_4,
        po_5: item.po_5,
        po_6: item.po_6,
        po_7: item.po_7,
        po_8: item.po_8,
        po_9: item.po_9,
        po_10: item.po_10,
        po_11: item.po_11,
        po_12: item.po_12,
        pso_1: item.pso_1,
        pso_2: item.pso_2,
      });
       await api.put(`api/copo/set-averages/update/${selectedCourseId}`,{averages})
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    "CO Name",
    "PO1",
    "PO2",
    "PO3",
    "PO4",
    "PO5",
    "PO6",
    "PO7",
    "PO8",
    "PO9",
    "PO10",
    "PO11",
    "PO12",
    "PSO1",
    "PSO2",
    "Actions",
  ];

  const calculateAverages = () => {
    const columnTotals = {
      po_1: 0,
      po_2: 0,
      po_3: 0,
      po_4: 0,
      po_5: 0,
      po_6: 0,
      po_7: 0,
      po_8: 0,
      po_9: 0,
      po_10: 0,
      po_11: 0,
      po_12: 0,
      pso_1: 0,
      pso_2: 0,
    };
    const columnCounts = {
      po_1: 0,
      po_2: 0,
      po_3: 0,
      po_4: 0,
      po_5: 0,
      po_6: 0,
      po_7: 0,
      po_8: 0,
      po_9: 0,
      po_10: 0,
      po_11: 0,
      po_12: 0,
      pso_1: 0,
      pso_2: 0,
    };

    copo.forEach((item) => {
      Object.keys(columnTotals).forEach((col) => {
        if (item[col] !== null && item[col] !== 0) {
          columnTotals[col] += item[col];
          columnCounts[col] += 1;
        }
      });
    });

    const averages = {};
    Object.keys(columnTotals).forEach((col) => {
      averages[col] =
        columnCounts[col] === 0
          ? 0
          : (columnTotals[col] / columnCounts[col]).toFixed(2);
    });

    return averages;
  };
  const getYearFromSemester = (semester) => {
    if (semester === 1 || semester === 2) return "FE";
    if (semester === 3 || semester === 4) return "SE";
    if (semester === 5 || semester === 6) return "TE";
    if (semester === 7 || semester === 8) return "BE";
    return "Unknown";
  };


  const averages = calculateAverages();

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  return (
    <div className="  left-0 z-45 w-full mt-8">
      <div className="container mx-auto p-4">
      <h1 className="text-3xl md:text-4xl lg:text-5xl mb-6 text-blue-700 text-center font-extrabold flex justify-center">CO PO Mapping</h1>
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl">
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              {/* Course Selector */}
              <CourseSelector
                uid={uid}
                onUserCourseIdChange={(newUserCourseId) => {
                  setUserCourseId(newUserCourseId); // Update state
                  handleCourseChange(newUserCourseId); // Call additional function
                }}
              />

              {/* Display Termwork Data */}
            </div>
          </div>
        </div>
        {selectedCourseId && copo.length > 0 && usercoursedata && (
          <>

        <div className="overflow-x-auto p-4" >

      <table className="min-w-full border-collapse border border-purple-400" ref={addToRefs}>
        <tbody>
          <tr className="bg-purple-600 text-white">
            <th className="px-4 py-2 border border-purple-400 text-left">
              Program Name
            </th>
            <td className="px-4 py-2 border border-purple-400">
             {usercoursedata.branch}
            </td>
          </tr>
          <tr className="bg-purple-100">
            <th className="px-4 py-2 border border-purple-400 text-left">
              Year / Semester
            </th>
            <td className="px-4 py-2 border border-purple-400">
            {getYearFromSemester(usercoursedata.semester)} /{" "} {usercoursedata.semester}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 border border-purple-400 text-left">
              Year
            </th>
            <td className="px-4 py-2 border border-purple-400">
              {usercoursedata.academic_year}
            </td>
          </tr>
          <tr className="bg-purple-100">
            <th className="px-4 py-2 border border-purple-400 text-left">
              Subject
            </th>
            <td className="px-4 py-2 border border-purple-400">
              {usercoursedata.course_name}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 border border-purple-400 text-left">
              Subject Code
            </th>
            <td className="px-4 py-2 border border-purple-400">
              {usercoursedata.coursecode}
            </td>
          </tr>
          <tr className="bg-purple-100">
            <th className="px-4 py-2 border border-purple-400 text-left">
              Faculty Name
            </th>
            <td className="px-4 py-2 border border-purple-400">
              {usercoursedata.teacher_names}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
      <div className="overflow-x-auto p-4" >
      <table className="min-w-full border-collapse border border-purple-400" ref={addToRefs}>
        <thead>
          <tr className="bg-purple-600 text-white">
          <th className="px-4 py-2 border border-purple-400">Sr. NO.</th>
            <th className="px-4 py-2 border border-purple-400">Co Name</th>
            <th className="px-4 py-2 border border-purple-400">COURSE OUTCOMES (COs)</th>
          </tr>
        </thead>
        <tbody>
          {cosdata.map((co, index) => (
            <tr key={co.idcos} className={index % 2 === 0 ? "bg-purple-100" : "bg-white"}>
              <td className="px-4 py-2 border border-purple-400 text-center">{index + 1}</td>
              <td className="px-4 py-2 border border-purple-400 text-center">{co.co_name}</td>
              <td className="px-4 py-2 border border-purple-400">{co.co_body}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
   
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg" >
          <button
        onClick={toggleEdit}
        className={`bg-${isEditable ? 'green' : 'blue'}-500 text-white px-4 py-2 rounded-md shadow-sm mb-4`}
      >
        {isEditable ? "Save" : "Edit"}
      </button>
      <table className="min-w-full divide-y divide-gray-200" ref={addToRefs}>
  <thead className="bg-purple-600">
    <tr>
      {headers.map((header) => (
        <th
          key={header}
          className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
            header === "CO Name" ? "sticky left-0 bg-purple-700 z-10" : ""
          } ${header === "Average" ? "sticky right-0 bg-purple-600 z-10" : ""}`}
        >
          {header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {copo.map((item, index) => (
      <tr
        key={item.co_id}
        className={index % 2 === 0 ? "bg-purple-50" : "bg-white"}
      >
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
          {item.co_name}
        </td>

        {/* Loop through PO fields */}
        {[...Array(12)].map((_, poIndex) => (
          <td
            key={`po_${poIndex + 1}`}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
          >
            {isEditable ? (
              <input
                type="number"
                min="1"
                max="3"
                value={item[`po_${poIndex + 1}`] || ""}
                onChange={(e) =>
                  handleChange(index, `po_${poIndex + 1}`, e.target.value)
                }
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            ) : (
              item[`po_${poIndex + 1}`] || "N/A"
            )}
          </td>
        ))}

        {/* Loop through PSO fields */}
        {[1, 2].map((pso) => (
          <td
            key={`pso_${pso}`}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
          >
            {isEditable ? (
              <input
                type="number"
                min="1"
                max="3"
                value={item[`pso_${pso}`] || ""}
                onChange={(e) =>
                  handleChange(index, `pso_${pso}`, e.target.value)
                }
                className="w-full border-gray-300 rounded-md shadow-sm"
              />
            ) : (
              item[`pso_${pso}`] || "N/A"
            )}
          </td>
        ))}

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {isEditable ? (
            <button
              onClick={() => handleSave(item.co_id)}
              className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-600"
            >
              Save
            </button>
          ) : (
            <span>Saved</span>
          )}
        </td>
      </tr>
    ))}

    {/* Average row */}
    <tr className="bg-purple-100 font-semibold">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
        Average
      </td>
      {[...Array(12)].map((_, poIndex) => (
        <td
          key={`avg_po_${poIndex + 1}`}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        >
          {averages[`po_${poIndex + 1}`]}
        </td>
      ))}
      {[1, 2].map((pso) => (
        <td
          key={`avg_pso_${pso}`}
          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
        >
          {averages[`pso_${pso}`]}
        </td>
      ))}
      <td className="px-6 py-4 whitespace-nowrap"></td>
    </tr>
  </tbody>
</table>

          </div>
          <div className="flex justify-center items-center">
  <button
    onClick={generatePDF}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 mt-2 px-4 rounded flex items-center"
  >
    <AiFillFilePdf className="text-white w-5 h-5 mr-2" />
    PDF
  </button>
</div>

          </>
        )}

      </div>
    </div>
  );
};

export default CoposhowComponent;
