import React, { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PDFGenerator = ({ tableRefs }) => {

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

  return (
    <button
      onClick={generatePDF}
      className="bg-purple-600 mt-4 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      Download PDF
    </button>
  );
};

export default PDFGenerator;
