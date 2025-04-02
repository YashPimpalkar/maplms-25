import React, { useEffect, useState, useRef } from "react";
import TableRow from "./TableRow";
import api from "../../api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { AiFillFilePdf } from 'react-icons/ai';
import StorePsoResult from "./StorePsoResult";




const MainResult = ({ userCourseId, selectedTwid, Termworkdata }) => {
  const uid = userCourseId;
  const [loData, setLoData] = useState([]);
  const [oralAverage, setoralAverage] = useState(0); // Start with an empty array
  const [univAverage, setUnivAverage] = useState(null); // Initially null, to be calculated
  const [intaAverage, setIntaAverage] = useState(null); // Initially null, to be calculated
  const [Average, setAverage] = useState(0);
  const [twAverage, settwAverage] = useState(0);
  const [DirectTotalAttainSixty, setDirectTotalAttainSixty] = useState(null); // Initially null
  const [DirectTotalAttainForty, setDirectTotalAttainForty] = useState(null); // Initially null
  const [FinalDirectCourseAttainment, setFinalDirectCourseAttainment] =
    useState(null); // Initially null
  const [FinalIndirectCourseAttainment, setFinalIndirectCourseAttainment] =
    useState(null); // Initially null
  const [TotalAttainmentEighty, setTotalAttainmentEighty] = useState(null); // Initially null
  const [TotalAttainmentTwenty, setTotalAttainmentTwenty] = useState(null); // Initially null
  const [TotalAttainment, setTotalAttainment] = useState(null); // Initially null
  const [AverageAttainment, setAverageAttainment] = useState(0);
  const [poPsoData, setPoPsoData] = useState([]);
    const [usercoursedata,SetUserCourseDetails] =useState(null)
  

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
  

 
    
   
  
  const exportTableToExcel = (tableId, fileName) => {
    // Find the table element
    const table = document.getElementById(tableId);

    // Convert table to a worksheet
    const worksheet = XLSX.utils.table_to_sheet(table);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Convert workbook to a binary buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save the file using file-saver
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${fileName}.xlsx`);
  };

  const exportTwoTablesToExcel = (tableId1, tableId2, fileName) => {
    // Find the table elements
    const table1 = document.getElementById(tableId1);
    const table2 = document.getElementById(tableId2);

    // Convert tables to worksheets
    const worksheet1 = XLSX.utils.table_to_sheet(table1);
    const worksheet2 = XLSX.utils.table_to_sheet(table2);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Append both worksheets to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet1, "Sheet1");
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Sheet2");

    // Convert workbook to a binary buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save the file using file-saver
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${fileName}.xlsx`);
  };

  const exportTablesToSingleSheet = (tableId1, tableId2, fileName) => {
    // Find the table elements
    const table1 = document.getElementById(tableId1);
    const table2 = document.getElementById(tableId2);

    // Convert tables to worksheets
    const worksheet1 = XLSX.utils.table_to_sheet(table1);
    const worksheet2 = XLSX.utils.table_to_sheet(table2);

    // Combine the data from both worksheets
    const combinedData = [
      ...XLSX.utils.sheet_to_json(worksheet1, { header: 1 }),
    ];
    const table2Data = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });

    // Add an empty row as a separator
    combinedData.push([]);
    combinedData.push(...table2Data);

    // Create a single worksheet from the combined data
    const combinedWorksheet = XLSX.utils.aoa_to_sheet(combinedData);

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Append the combined worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, combinedWorksheet, "CombinedSheet");

    // Convert workbook to a binary buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save the file using file-saver
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `${fileName}.xlsx`);
  };

  useEffect(() => {
    const fetchCosData = async (uid) => {
      console.log(uid);

      try {
        const [
          response1,
          response2,
          response3,
          response4,
          response5,
          response6,
        ] = await Promise.all([
          api.get(`/api/result/ia1/${uid}`),
          api.get(`/api/result/ia2/${uid}`),
          api.get(`/api/result/ia-combine/${uid}`),
          api.get(`/api/result/semester/${uid}`),
          api.get(`/api/result/termwork/${uid}`),
          api.get(`/api/result/feedback/${uid}`),
        ]);

        const ia1Data = response1.data || [];
        const ia2Data = response2.data || [];
        const intaData = response3.data || [];
        const univData = response4.data || [];
        const twData = response5.data || [];
        const indirectData = response6.data || [];
        console.log("yash", indirectData);
        api
          .get(`/api/result/popso/${uid}`)
          .then((response) => {
            console.log(response);
            setPoPsoData(response.data); // Assuming the data is returned in the required format
          })
          .catch((error) => {
            console.error("Error fetching PO, PSO data:", error);
          });

        const ia1Map = ia1Data.reduce((acc, ia1Item) => {
          acc[ia1Item.coname] = Number(ia1Item.categorization) || 0;
          return acc;
        }, {});

        const ia2Map = ia2Data.reduce((acc, ia2Item) => {
          acc[ia2Item.coname] = Number(ia2Item.categorization) || 0;
          return acc;
        }, {});

        const intaMap = intaData.reduce((acc, intaItem) => {
          acc[intaItem.coname] = Number(intaItem.categorization) || 0;
          return acc;
        }, {});

        const univMap = univData.reduce((acc, univItem) => {
          acc[univItem.coname] = Number(univItem.categorization) || 0;
          return acc;
        }, {});

        const twMap = twData.reduce((acc, twItem) => {
          acc[twItem.coname] = Number(twItem.categorization) || 0;
          return acc;
        }, {});

        const oralMap = univData.reduce((acc, oralItem) => {
          acc[oralItem.coname] = Number(oralItem.categorization) || 0;
          return acc;
        }, {});

        const indirectMap = indirectData.reduce((acc, item) => {
          acc[item.coname] = Number(item.categorization) || 0;
          return acc;
        }, {});

        const combinedData = Array.from(
          new Set([
            ...ia1Data.map((item) => item.coname),
            ...ia2Data.map((item) => item.coname),
            ...intaData.map((item) => item.coname),
            ...univData.map((item) => item.coname),
            ...twData.map((item) => item.coname),
            ...indirectData.map((item) => item.coname),
          ])
        ).map((coname) => {
          const intaAttainment = intaMap[coname] || 0;
          const univAttainment = univMap[coname] || 0;
          const oralattainment = oralMap[coname] || 0;
          const twAttainment = twMap[coname] || 0;
          console.log(intaAttainment, univAttainment);
          const averageAttainment = (
            (intaAttainment + twAttainment) /
            2
          ).toFixed(2);

          const directAttainment =
            selectedTwid == 1
              ? (
                  ((60 / 100) * intaAttainment + (40 / 100) * univAttainment) *
                  (80 / 100)
                )
              : selectedTwid == 2
              ? ((60 / 100) * averageAttainment + (40 / 100) * univAttainment) *
                (80 / 100)
              : selectedTwid == 3
              ? (80 / 100) * twAttainment
              : selectedTwid == 4
              ? ((60 / 100) * twAttainment + (40 / 100) * univAttainment) *
                (80 / 100)
              : (
                  ((60 / 100) * averageAttainment +
                    (40 / 100) * univAttainment) *
                  (80 / 100)
                );

          // Dummy indirect attainment value
          const indirectAttainmentvalues = indirectMap[coname] || 0;
          console.log("yayyy", indirectAttainmentvalues);

          const indirectAttainment = (
            indirectAttainmentvalues *
            (20 / 100)
          ).toFixed(2); // separate indirect attainment column

          const totalatt =
            parseFloat(directAttainment) + parseFloat(indirectAttainment);

          return {
            coname,
            ia1_attainment: ia1Map[coname] || 0,
            ia2_attainment: ia2Map[coname] || 0,
            attainment: intaAttainment,
            oralattainment: oralattainment,
            univattainment: univAttainment,
            twAttainment: twAttainment,
            average: averageAttainment,
            direct: directAttainment,
            indirect: indirectAttainmentvalues,
            indirectatt: indirectAttainment,
            total: totalatt,
          };
        });

        const twAverage =
          combinedData
            .filter((item) => item.twAttainment)
            .reduce((sum, item) => sum + Number(item.twAttainment), 0) /
          combinedData.length;

        const validUnivAttainments = combinedData
          .filter(
            (item) =>
              item.univattainment !== null && item.univattainment !== undefined
          )
          .map((item) => item.univattainment);

        const univaverage =
          validUnivAttainments.length > 0
            ? validUnivAttainments.reduce((sum, val) => sum + Number(val), 0) /
              validUnivAttainments.length
            : 0;
        setUnivAverage(univaverage.toFixed(2));
        // localStorage.setItem('univAverage', univaverage.toFixed(1));

        const validIntaAttainments = combinedData
          .filter(
            (item) => item.attainment !== null && item.attainment !== undefined
          )
          .map((item) => item.attainment);

        const intaaverage =
          validIntaAttainments.length > 0
            ? validIntaAttainments.reduce((sum, val) => sum + Number(val), 0) /
              validIntaAttainments.length
            : 0;

        const oralAverage =
          combinedData
            .filter((item) => item.oralattainment)
            .reduce((sum, item) => sum + Number(item.oralattainment), 0) /
          combinedData.length;

        setIntaAverage(intaaverage.toFixed(2));
        // localStorage.setItem('intaAverage', intaaverage.toFixed(1));
        setoralAverage(oralAverage.toFixed(2));
        const averageattainment = (intaaverage + twAverage) / 2;
        const validAttainments = combinedData
          .filter((item) => item.average !== null && item.average !== undefined)
          .map((item) => item.average);
        const average =
          validAttainments.length > 0
            ? validAttainments.reduce((sum, val) => sum + Number(val), 0) /
              validAttainments.length
            : 0;
        setAverage(average.toFixed(2));

        const validFinalIndirectatt = combinedData
          .filter(
            (item) => item.indirect !== null && item.indirect !== undefined
          )
          .map((item) => item.indirect);
        const indirectaverage =
          validFinalIndirectatt.length > 0
            ? validFinalIndirectatt.reduce((sum, val) => sum + Number(val), 0) /
              validFinalIndirectatt.length
            : 0;
        setFinalIndirectCourseAttainment(indirectaverage.toFixed(2));
        // localStorage.setItem('FinalIndirectCourseAttainment', indirectaverage.toFixed(1));

        // 60%
        const directattainsixty =
        selectedTwid === 1
          ? (60 / 100) * intaaverage
          : (60 / 100) * average;
      
        setDirectTotalAttainSixty(directattainsixty.toFixed(2));
        // localStorage.setItem('DirectTotalAttainSixty', directattainsixty.toFixed(1));

        // 40%
        const directattainforty = (40 / 100) * univaverage;
      
        setDirectTotalAttainForty(directattainforty.toFixed(2));
        // localStorage.setItem('DirectTotalAttainForty', directattainforty.toFixed(1));

        // Total 60% and 40%
        const finaldirectattainment = directattainsixty + directattainforty;
        setFinalDirectCourseAttainment(finaldirectattainment.toFixed(2));
        // localStorage.setItem('FinalDirectCourseAttainment', finaldirectattainment.toFixed(1));

        // Total on 80%
        const totalattainmenteighty =
          selectedTwid === 3 ||
          selectedTwid === 8 ||
          selectedTwid === 5 ||
          selectedTwid === 6 ||
          selectedTwid === 12
            ? (80 / 100) * twAverage
            : (80 / 100) * finaldirectattainment;

        setTotalAttainmentEighty(totalattainmenteighty.toFixed(2));
        // localStorage.setItem('TotalAttainmentEighty', totalattainmenteighty.toFixed(2));

        //20%
        const totalattainmenttwenty = (20 / 100) * indirectaverage;
        setTotalAttainmentTwenty(totalattainmenttwenty.toFixed(2));

        settwAverage(twAverage.toFixed(2));
        setAverageAttainment(averageattainment.toFixed(2));
        // localStorage.setItem('TotalAttainmentTwenty', totalattainmenttwenty.toFixed(2));

        //Total attainment of 80 and 20 (i.e course attainment)
        const totalattainmentt = totalattainmenteighty + totalattainmenttwenty;
        setTotalAttainment(totalattainmentt.toFixed(2));
        // localStorage.setItem('TotalAttainment', totalattainmentt.toFixed(2));

        setLoData(combinedData);
        // localStorage.setItem('loData', JSON.stringify(combinedData));
      } catch (error) {
        console.error("Error fetching COS data", error);
      }
    };

    if (uid) {
      fetchCosData(uid);
    }
  }, [uid]);
  const getYearFromSemester = (semester) => {
    if (semester === 1 || semester === 2) return "FE";
    if (semester === 3 || semester === 4) return "SE";
    if (semester === 5 || semester === 6) return "TE";
    if (semester === 7 || semester === 8) return "BE";
    return "Unknown";
  };

  useEffect(() => {
    const fetchUserCourseData = async () => {
      try {
    
        const res = await api.get(`/api/usercourse/details/${userCourseId}`);
        SetUserCourseDetails(res.data[0]);
      } catch (error) {
        console.error("Error fetching course data:", error);
        SetUserCourseDetails(null)
      } finally {
 
      }
    };

    if (userCourseId) {
      fetchUserCourseData();
    }
  }, [userCourseId]);
  // console.log(loData);

  // console.log(selectedTwid);
  // console.log(Termworkdata);

  return (
    <div>
      <div class="container mx-auto mt-5 px-4" >
        {usercoursedata && (
       <>
        <h1 class="text-2xl md:text-3xl lg:text-4xl mb-6 text-purple-700 text-center font-bold">
          {" "}
          {Termworkdata["twbody"]}
        </h1>

        <div className="container">
        <div className="overflow-x-auto mb-2" >

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
        </div>

        <div className="container">
          <div class="overflow-x-auto"ref={addToRefs} >
            <table
              class="min-w-full bg-white border border-gray-200"
              id="Lab_Outcome"
            >
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th
                    className="border border-gray-300 bg-purple-600 text-white p-2"
                    colSpan={
                      selectedTwid === 1
                        ? 10
                        : selectedTwid === 2
                        ? 11
                        : selectedTwid === 3 ||
                          selectedTwid === 8 ||
                          selectedTwid === 5 ||
                          selectedTwid === 6 ||
                          selectedTwid === 12 ||
                          selectedTwid === 4 ||
                          selectedTwid === 7 ||
                          selectedTwid === 10 ||
                          selectedTwid === 11 ||
                          selectedTwid === 13 ||
                          selectedTwid === 14
                        ? 8
                        : selectedTwid === 9
                        ? 12
                        : 12
                    }
                  >
                    Lab Course Attainment
                  </th>
                </tr>

                <tr>
                  <th
                    className="border border-gray-300 text-white bg-purple-600 p-2 text-center"
                    colSpan={
                      selectedTwid === 1
                        ? 5
                        : selectedTwid === 2
                        ? 6
                        : selectedTwid === 3 ||
                          selectedTwid === 8 ||
                          selectedTwid === 5 ||
                          selectedTwid === 6 ||
                          selectedTwid === 12
                        ? 2
                        : selectedTwid === 4 ||
                          selectedTwid === 7 ||
                          selectedTwid === 10 ||
                          selectedTwid === 11 ||
                          selectedTwid === 13 ||
                          selectedTwid === 14
                        ? 3
                        : 7
                    }
                  >
                    Direct Course Attainment Calculations
                  </th>
                  <th
                    className="border bg-purple-600 text-white border-gray-300 p-2 text-center"
                    rowSpan={2}
                    colSpan={2}
                  >
                    Indirect Course Attainment Calculation
                  </th>
                  <th
                    className="border bg-purple-600 text-white border-gray-300 p-2 text-center"
                    rowSpan={2}
                  >
                    Direct Attainment
                  </th>
                  <th 
                    className="border bg-purple-600 text-white border-gray-300 p-2 text-center"
                    rowSpan={2}
                  >
                    Indirect Attainment
                  </th>
                  <th
                    className="border bg-purple-600 text-white border-gray-300 p-2 text-center"
                    rowSpan={2}
                  >
                    Total Attainment
                  </th>
                </tr>

                {selectedTwid === 1 ? (
                  <tr>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      CO
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      IA1
                    </th> 
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      IA2
                    </th>
                    <th className="border bg-purple-600 text-white  border-gray-300 p-2 text-center">
                      INTA
                    </th>
                    <th className="border bg-purple-600  text-white border-gray-300 p-2 text-center">
                      UNIV
                    </th>
                  </tr>
                ) : selectedTwid === 2 ? (
                  <tr>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      CO
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      IA1
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      IA2
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      INTA
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      TW
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      UNIV
                    </th>
                  </tr>
                ) : selectedTwid === 3 ||
                  selectedTwid === 8 ||
                  selectedTwid === 5 ||
                  selectedTwid === 6 ||
                  selectedTwid === 12 ? (
                  <tr>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      CO/LO
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      TW
                    </th>
                  </tr>
                ) : selectedTwid === 4 ||
                  selectedTwid === 7 ||
                  selectedTwid === 10 ||
                  selectedTwid === 11 ||
                  selectedTwid === 13 ||
                  selectedTwid === 14 ? (
                  <tr>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      CO/LO
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      TW
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      OR
                    </th>
                  </tr>
                ) : selectedTwid === 9 ? (
                  <tr>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      CO
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      IA1
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      IA2
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      INTA
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      ASSIGNMENTS
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      AVERAGE
                    </th>
                    <th className="border bg-purple-600 text-white border-gray-300 p-2 text-center">
                      UNIV
                    </th>
                  </tr>
                ) : null}
              </thead>
              <tbody>
                <TableRow
                  loData={loData}
                  userCourseId={userCourseId}
                  selectedTwid={selectedTwid}
                  FinalIndirectCourseAttainment={FinalIndirectCourseAttainment}
                  intaAverage={intaAverage}
                  univAverage={univAverage}
                />
                <tr>
                  {/* Attainment and Final Indirect Course Attainment Rows */}
                  {selectedTwid == 1 ? (
                    <>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        colSpan={3}
                      >
                        Attainment
                      </td>
                      <td className="border  border-gray-300 p-2 text-center">
                        {intaAverage}
                      </td>
                      <td className="border  border-gray-300 p-2 text-center">
                        {univAverage}
                      </td>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        rowSpan={4}
                      >
                        Final Indirect Course Attainment
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center"
                        rowSpan={4}
                      >
                        {FinalIndirectCourseAttainment}
                      </td>
                    </>
                  ) : selectedTwid == 2 ? (
                    <>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        colSpan={3}
                      >
                        Attainment
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {intaAverage}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {twAverage}
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center"
                        rowSpan={2}
                      >
                        {univAverage}
                      </td>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        rowSpan={5}
                      >
                        Final Indirect Course Attainment
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center"
                        rowSpan={5}
                      >
                        {FinalIndirectCourseAttainment}
                      </td>
                    </>
                  ) : selectedTwid === 3 ||
                    selectedTwid === 8 ||
                    selectedTwid === 5 ||
                    selectedTwid === 6 ||
                    selectedTwid === 12 ? (
                    <>
                      <td className="border bg-purple-200 border-gray-300 p-2 text-center">
                        Attainment
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {twAverage}
                      </td>
                      <td className="border bg-purple-200 border-gray-300 p-2 text-center">
                        Final Indirect Course Attainment
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {FinalIndirectCourseAttainment}
                      </td>
                    </>
                  ) : selectedTwid === 4 ||
                    selectedTwid === 7 ||
                    selectedTwid === 10 ||
                    selectedTwid === 11 ||
                    selectedTwid === 13 ||
                    selectedTwid === 14 ? (
                    <>
                      <td className="border bg-purple-200 border-gray-300 p-2 text-center">
                        Attainment
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {twAverage}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {oralAverage}
                      </td>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        rowSpan={4}
                      >
                        Final Indirect Course Attainment
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center"
                        rowSpan={4}
                      >
                        {FinalIndirectCourseAttainment}
                      </td>
                    </>
                  ) : selectedTwid == 9 ? (
                    <>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        colSpan={5}
                      >
                        AVERAGE
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {Average}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {univAverage}
                      </td>
                      <td
                        className="border bg-purple-200 border-gray-300 p-2 text-center"
                        rowSpan={4}
                      >
                        Final Indirect Course Attainment
                      </td>
                      <td
                        className="border border-gray-300 p-2 text-center"
                        rowSpan={4}
                      >
                        {FinalIndirectCourseAttainment}
                      </td>
                    </>
                  ) : null}
                </tr>
                {selectedTwid == 2 ? (
                  <tr>
                    <td
                      className="border bg-purple-200 border-gray-300 p-2 text-center"
                      colSpan={3}
                    >
                      Average Attainment of TW and INTA
                    </td>
                    <td> {AverageAttainment}</td>
                  </tr>
                ) : (
                  <></>
                )}
                {selectedTwid !== 3 &&
                  selectedTwid !== 8 &&
                  selectedTwid !== 5 &&
                  selectedTwid !== 6 &&
                  selectedTwid !== 12 && (
                    <>
                      <tr>
                        <td
                          className="border bg-purple-200 border-gray-300 p-2 text-center"
                          colSpan={
                            selectedTwid === 3
                              ? 1
                              : selectedTwid === 4
                              ? 1
                              : selectedTwid === 9
                              ? 5
                              : 3
                          }
                        >
                          Weightage
                        </td>
                        <td
                          colSpan={selectedTwid === 2 ? 2 : 1}
                          className="border bg-purple-200 border-gray-300 p-2 text-center"
                        >
                          60%
                        </td>
                        <td className="border bg-purple-200 border-gray-300 p-2 text-center">
                          40%
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border bg-purple-200 border-gray-300 p-2 text-center"
                          colSpan={
                            selectedTwid === 1 || selectedTwid === 2
                              ? 3
                              : selectedTwid === 3 ||
                                selectedTwid === 8 ||
                                selectedTwid === 5 ||
                                selectedTwid === 6 ||
                                selectedTwid === 12
                              ? 2
                              : selectedTwid === 4 ||
                                selectedTwid === 7 ||
                                selectedTwid === 10 ||
                                selectedTwid === 11 ||
                                selectedTwid === 13 ||
                                selectedTwid === 14
                              ? 1
                              : selectedTwid === 9
                              ? 5
                              : 3
                          }
                        >
                          Direct Total Attainment
                        </td>
                        <td
                          colSpan={
                            selectedTwid === 2
                              ? 2
                              : selectedTwid === 4 ||
                                selectedTwid === 7 ||
                                selectedTwid === 10 ||
                                selectedTwid === 11 ||
                                selectedTwid === 13 ||
                                selectedTwid === 14
                              ? 1
                              : 1
                          }
                          className="border border-gray-300 p-2 text-center"
                        >
                          {DirectTotalAttainSixty}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          {DirectTotalAttainForty}
                        </td>
                      </tr>
                      <tr>
                        <td
                          className="border bg-purple-200 border-gray-300 p-2 text-center"
                          colSpan={
                            selectedTwid === 4 ||
                            selectedTwid === 7 ||
                            selectedTwid === 10 ||
                            selectedTwid === 11 ||
                            selectedTwid === 13 ||
                            selectedTwid === 14
                              ? 1
                              : selectedTwid === 9
                              ? 5
                              : 3
                          }
                        >
                          Final Direct Course Attainment
                        </td>
                        <td
                          className="border border-gray-300 p-2 text-center"
                          colSpan={
                            selectedTwid === 1 ? 2 : selectedTwid === 2 ? 3 : 2
                          }
                        >
                          {FinalDirectCourseAttainment}
                        </td>
                      </tr>
                    </>
                  )}

                <tr>
                  <td
                    className="border bg-purple-200 border-gray-300 p-2 text-center"
                    colSpan={
                      selectedTwid === 3 ||
                      selectedTwid === 8 ||
                      selectedTwid === 5 ||
                      selectedTwid === 6 ||
                      selectedTwid === 12 ||
                      selectedTwid === 4 ||
                      selectedTwid === 7 ||
                      selectedTwid === 10 ||
                      selectedTwid === 11 ||
                      selectedTwid === 13 ||
                      selectedTwid === 14
                        ? 1
                        : selectedTwid === 2
                        ? 3
                        : selectedTwid === 9
                        ? 5
                        : 3
                    }
                  >
                    Weightage
                  </td>
                  <td
                    className="border bg-purple-200 border-gray-300 p-2 text-center"
                    colSpan={
                      selectedTwid === 1
                        ? 2
                        : selectedTwid === 2
                        ? 3
                        : selectedTwid === 3 ||
                          selectedTwid === 8 ||
                          selectedTwid === 5 ||
                          selectedTwid === 6 ||
                          selectedTwid === 12
                        ? 1
                        : 2
                    }
                  >
                    80%
                  </td>
                  <td
                    className="border bg-purple-200 border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    20%
                  </td>
                </tr>
                <tr>
                  <td
                    className="border bg-purple-200 border-gray-300 p-2 text-center"
                    colSpan={
                      selectedTwid === 1
                        ? 3
                        : selectedTwid === 2
                        ? 3
                        : selectedTwid === 3 ||
                          selectedTwid === 8 ||
                          selectedTwid === 5 ||
                          selectedTwid === 6 ||
                          selectedTwid === 12 ||
                          selectedTwid === 4 ||
                          selectedTwid === 7 ||
                          selectedTwid === 10 ||
                          selectedTwid === 11 ||
                          selectedTwid === 13 ||
                          selectedTwid === 14
                        ? 1
                        : selectedTwid === 9
                        ? 5
                        : 2
                    }
                  >
                    Total Attainment
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={
                      selectedTwid === 1
                        ? 2
                        : selectedTwid === 2
                        ? 3
                        : selectedTwid === 3 ||
                          selectedTwid === 8 ||
                          selectedTwid === 5 ||
                          selectedTwid === 6 ||
                          selectedTwid === 12
                        ? 1
                        : 2
                    }
                  >
                    {TotalAttainmentEighty}
                  </td>
                  <td
                    className="border border-gray-300 p-2 text-center"
                    colSpan={2}
                  >
                    {TotalAttainmentTwenty}
                  </td>
                </tr>
                <tr>
                  <td
                    className="border bg-purple-200 border-gray-300 p-2 text-center"
                    colSpan={
                      selectedTwid === 3 ||
                      selectedTwid === 8 ||
                      selectedTwid === 5 ||
                      selectedTwid === 6 ||
                      selectedTwid === 12 ||
                      selectedTwid == 4
                        ? 1
                        : selectedTwid === 9
                        ? 5
                        : 3
                    }
                  >
                    <strong >Course Attainment:</strong>
                  </td>
                  <td
                    className="border bg-purple-200 border-gray-300 p-2 text-center"
                    colSpan={
                      selectedTwid === 1
                        ? 4
                        : selectedTwid === 2
                        ? 5
                        : selectedTwid === 3 ||
                          selectedTwid === 8 ||
                          selectedTwid === 5 ||
                          selectedTwid === 6 ||
                          selectedTwid === 12
                        ? 3
                        : 4
                    }
                  >
                    {TotalAttainment}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-center m-8">
            <button
              onClick={() =>
                exportTableToExcel("Lab_Outcome", `${Termworkdata["twbody"]}`)
              }
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download as Excel
            </button>
          </div>
          <div ref={addToRefs}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl mb-6 text-purple-700 text-center font-bold">
            PO, PSO Attainment
          </h2>
          <div className="overflow-x-auto">
          <table
  className="min-w-full divide-y border-collapse border border-gray-300 text-sm md:text-base"
  id="POPSO"
>
  <thead className="sticky top-0 bg-purple-600 text-white z-10">
    <tr>
      <th className="border border-gray-300 p-2" colSpan={15}>
        PO, PSO Attainment
      </th>
    </tr>
    <tr>
      <th className="border bg-white border-gray-300 p-2 text-black" colSpan={13}>
        PO
      </th>
      <th className="border bg-white border-gray-300 p-2 text-black" colSpan={2}>
        PSO
      </th>
    </tr>
    <tr>
      <th className="border border-gray-300 p-2">LO</th>
      {[...Array(12).keys()].map((i) => (
        <th key={i} className="border border-gray-300 p-2">
          PO{i + 1}
        </th>
      ))}
      <th className="border border-gray-300 p-2">PSO1</th>
      <th className="border border-gray-300 p-2">PSO2</th>
    </tr>
  </thead>
  <tbody>
    {poPsoData.map((item, index) => {
      const totalatt = parseFloat(loData[index]?.total) || 0;
      return (
        <tr key={index} className={index % 2 === 0 ? "bg-purple-200" : "bg-white"}>
          <td className="border border-gray-300 p-2 text-gray-900">
            {loData[index]?.coname}
          </td>
          {item.po.map((poValue, i) => (
            <td key={i} className="border border-gray-300 p-2 text-gray-500">
              {poValue !== null
                ? ((poValue * totalatt) / 3).toFixed(2)
                : "-"}
            </td>
          ))}
          {item.pso.map((psoValue, i) => (
            <td key={i} className="border border-gray-300 p-2 text-gray-500">
              {psoValue !== null
                ? ((psoValue * totalatt) / 3).toFixed(2)
                : "-"}
            </td>
          ))}
        </tr>
      );
    })}

    {/* Average Row */}
    <tr className="bg-purple-300 font-semibold">
      <td className="border border-gray-300 p-2 text-gray-900">AVG</td>

      {/* Calculate Average for PO Columns */}
      {poPsoData.length > 0 &&
        poPsoData[0].po.map((_, i) => {
          const poValues = poPsoData
            .map((item, index) => {
              const totalatt = parseFloat(loData[index]?.total) || 0;
              const poValue =
                item.po[i] !== null ? parseFloat(item.po[i]) : null;
              return poValue !== null ? (poValue * totalatt) / 3 : null;
            })
            .filter((value) => value !== null);

          const poSum = poValues.reduce((acc, val) => acc + val, 0);
          const poAverage = poValues.length > 0 ? poSum / poValues.length : 0;
          return (
            <td key={i} className="border border-gray-300 p-2 text-gray-500">
              {poAverage.toFixed(2)}
            </td>
          );
        })}

      {/* Calculate Average for PSO Columns */}
      {poPsoData.length > 0 &&
        poPsoData[0].pso.map((_, i) => {
          const psoValues = poPsoData
            .map((item, index) => {
              const totalatt = parseFloat(loData[index]?.total) || 0;
              const psoValue =
                item.pso[i] !== null ? parseFloat(item.pso[i]) : null;
              return psoValue !== null ? (psoValue * totalatt) / 3 : null;
            })
            .filter((value) => value !== null);

          const psoSum = psoValues.reduce((acc, val) => acc + val, 0);
          const psoAverage = psoValues.length > 0 ? psoSum / psoValues.length : 0;
          return (
            <td key={i} className="border border-gray-300 p-2 text-gray-500">
              {psoAverage.toFixed(2)}
            </td>
          );
        })}
    </tr>
  </tbody>
</table>

          </div>
          </div>

           <StorePsoResult poPsoData={poPsoData} loData={loData} userCourseId={userCourseId} TotalAttainment={TotalAttainment} />
          <button
            onClick={() =>
              exportTablesToSingleSheet(
                "Lab_Outcome",
                "POPSO",
                `${Termworkdata["twbody"]}_POPSO`
              )
            }
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 mt-2 px-4 rounded"
          >
            Download as Excel
          </button>

               <div className="flex justify-center items-center">
            <button
              onClick={generatePDF}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 mt-2 px-4 rounded flex items-center"
            >
              <AiFillFilePdf className="text-white w-5 h-5 mr-2" />
              PDF
            </button>
          </div>
         </div>
         </>
         )}
      </div>
    </div>
  );
};

export default MainResult;
