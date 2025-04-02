import React from 'react';

const TableRow = ({ loData, selectedTwid, intaAverage, univAverage, FinalIndirectCourseAttainment }) => {
  return (
    <>
      {loData.map((item, index) => (
        <tr key={index} className={index % 2 === 0 ? "bg-purple-200" : "bg-white"}>
          
          {selectedTwid == 1 ? (
            <>
               <td className="border border-gray-300 p-2 text-center">{item.coname}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.ia1_attainment}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.ia2_attainment}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.attainment}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.univattainment}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.coname}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.indirect}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.direct}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.indirectatt}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.total.toFixed(2) || 'NA'}</td>
            </>
          ) : selectedTwid == 2 ? (
            <>
            
                <td className="border border-gray-300 p-2 text-center">
                  {item.coname}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.ia1_attainment}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.ia2_attainment}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.attainment}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.twAttainment}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.univattainment}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.coname}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.indirect}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.direct.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.indirectatt}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {item.total.toFixed(2) || "NA"}
                </td>
            
            </>
          ) : selectedTwid === 3 || selectedTwid === 8 || selectedTwid === 5 || selectedTwid === 6 ||selectedTwid === 12 ? (
            <>
             <td className="border border-gray-300 p-2 text-center">{item.coname}</td>
              <td className="border border-gray-300 p-2 text-center">{item.twAttainment}</td>
              <td className="border border-gray-300 p-2 text-center">{item.coname}</td>
              <td className="border border-gray-300 p-2 text-center">{item.indirect}</td>
              <td className="border border-gray-300 p-2 text-center">{item.direct?.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-center">{item.indirectatt}</td>
              <td className="border border-gray-300 p-2 text-center">{item.total?.toFixed(2) || 'NA'}</td>
            </>
          ) : selectedTwid === 4 || selectedTwid === 7 || selectedTwid === 10 || selectedTwid === 11 ||selectedTwid === 13 ||selectedTwid === 14 ? (
            <>
             <td className="border border-gray-300 p-2 text-center">{item.coname}</td>
              <td className="border border-gray-300 p-2 text-center">{item.twAttainment}</td>
              <td className="border border-gray-300 p-2 text-center">{item.oralattainment}</td>
              <td className="border border-gray-300 p-2 text-center">{item.coname}</td>
              <td className="border border-gray-300 p-2 text-center">{item.indirect}</td>
              <td className="border border-gray-300 p-2 text-center">{item.direct?.toFixed(2)}</td>
              <td className="border border-gray-300 p-2 text-center">{item.indirectatt}</td>
              <td className="border border-gray-300 p-2 text-center">{item.total?.toFixed(2) || 'NA'}</td>
            </>
          ) : selectedTwid ?(
            <>
            <td className="border border-gray-300 p-2 text-center">
            {item.coname}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.ia1_attainment}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.ia2_attainment}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.attainment}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.twAttainment}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.average}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.univattainment}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.coname}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.indirect}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.direct.toFixed(2)}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.indirectatt}
          </td>
          <td className="border border-gray-300 p-2 text-center">
            {item.total.toFixed(2) || "NA"}
          </td>
          </>
          ): null}
        </tr>
      ))}
 
    </>
  );
};

export default TableRow;
