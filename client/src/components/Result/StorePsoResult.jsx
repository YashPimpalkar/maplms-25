import React from "react";
import axios from "axios";
import api from "../../api";

const StorePsoResult = ({ poPsoData, loData, userCourseId ,TotalAttainment}) => {

  


  // Map over poPsoData and ensure po and pso exist
  const poPsoResults = poPsoData.map((item, index) => {
    const totalatt = parseFloat(loData[index]?.total) || 0;

    return {
      coname: loData[index]?.coname || "",
      poPso: [
        ...(item.po || []).map((poValue, i) => ({
          value: poValue !== null ? ((poValue * totalatt) / 3).toFixed(2) : "-",
          type: "PO",
        })),
        ...(item.pso || []).map((psoValue, i) => ({
          value: psoValue !== null ? ((psoValue * totalatt) / 3).toFixed(2) : "-",
          type: "PSO",
        })),
      ],
    };
  });

  // Calculate PO averages
  const poAverages = poPsoData[0]?.po?.map((_, i) => {
    const poValues = poPsoData
      .map((item, index) => {
        const totalatt = parseFloat(loData[index]?.total) || 0;
        const poValue = item.po[i] !== null ? parseFloat(item.po[i]) : null;
        return poValue !== null ? (poValue * totalatt) / 3 : null;
      })
      .filter((value) => value !== null);

    const poSum = poValues.reduce((acc, val) => acc + val, 0);
    return (poValues.length > 0 ? poSum / poValues.length : 0).toFixed(2);
  });

  // Calculate PSO averages
  const psoAverages = poPsoData[0]?.pso?.map((_, i) => {
    const psoValues = poPsoData
      .map((item, index) => {
        const totalatt = parseFloat(loData[index]?.total) || 0;
        const psoValue = item.pso[i] !== null ? parseFloat(item.pso[i]) : null;
        return psoValue !== null ? (psoValue * totalatt) / 3 : null;
      })
      .filter((value) => value !== null);

    const psoSum = psoValues.reduce((acc, val) => acc + val, 0);
    return (psoValues.length > 0 ? psoSum / psoValues.length : 0).toFixed(2);
  });

  // Merge PO and PSO averages
  const mergedAverages = {
    poPso: [
      ...(poAverages || []).map((avg, index) => ({
        value: avg,
        type: `po_${index + 1}`,  // PO label (po_1, po_2, ..., po_12)
      })),
      ...(psoAverages || []).map((avg, index) => ({
        value: avg,
        type: `pso_${index + 1}`,  // PSO label (pso_1, pso_2, ..., pso_4)
      })),
    ],
  };
  console.log(mergedAverages);
  const handleSubmit = async () => {
    try {
      const CoAttainmentResponse = await api.post("/api/result/coattainment", {
        userCourseId, // Include userCourseId in the rows data
       TotalAttainment,
      });
      if (CoAttainmentResponse.status !== 200) {
        throw new Error("Failed to submit CO Attainment data");
      }

      const coAttainmentData = loData.map((item) => ({
        coname: item.coname,
        total: item.total.toFixed(2),
      }));

      const CoResponse = await api.post("/api/result/cosattainment", {
        userCourseId, // Include userCourseId in the rows data
        coData: coAttainmentData,
      });
      if (CoResponse.status !== 200) {
        throw new Error("Failed to submit CO data");
      }
      // Submit rows data to API
      console.log(poPsoResults);
      const rowsResponse = await api.post("/api/result/storepso", {
        userCourseId, // Include userCourseId in the rows data
        data: poPsoResults,
      });

      if (rowsResponse.status !== 200) {
        throw new Error("Failed to submit rows data");
      }
      console.log(mergedAverages);

      // Submit averages data to API
      const averagesResponse = await api.post("/api/result/store-pso-averages", {
        mergedAverages,
        userCourseId,
      });

      if (averagesResponse.status !== 200) {
        throw new Error("Failed to submit averages data");
      }



      alert("Data submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error submitting data: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center mt-2 ">
      <button
        onClick={handleSubmit}
        className="bg-purple-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 shadow-md"
      >
        Store PSO to Database
      </button>
    </div>
  );
};





export default StorePsoResult;
