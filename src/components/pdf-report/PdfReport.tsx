'use client';

import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import styles from './PdfReport.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface AnalysisIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  code: string;
}

interface TestResult {
  passed: boolean;
  issues: AnalysisIssue[];
}

interface AnalysisResults {
  url: string;
  timestamp: string;
  summary: {
    passed: number;
    warnings: number;
    errors: number;
    total: number;
  };
  tests: {
    htmlStructure: TestResult;
    ariaUsage: TestResult;
    colorContrast: TestResult;
    keyboardAccessibility: TestResult;
    formAccessibility: TestResult;
  };
}

interface PdfReportProps {
  results: AnalysisResults;
}

const PdfReport: React.FC<PdfReportProps> = ({ results }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePdf = async () => {
    if (!results || isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Create a temporary div to render the report content
      const reportDiv = document.createElement('div');
      reportDiv.className = 'pdf-report-content';
      reportDiv.style.width = '700px';
      reportDiv.style.padding = '20px';
      reportDiv.style.position = 'absolute';
      reportDiv.style.left = '-9999px';
      document.body.appendChild(reportDiv);
      
      // Add report content
      const reportContent = `
        <div style="font-family: 'Nunito', Arial, sans-serif; color: #333;">
          <h1 style="color: #5755ee; text-align: center; margin-bottom: 10px;">A11Y Checker Report</h1>
          <h2 style="margin-top: 0; text-align: center; font-size: 16px; color: #666;">Accessibility Analysis</h2>
          
          <div style="margin: 20px 0; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h3>Analysis Summary</h3>
            <p><strong>Website:</strong> ${results.url}</p>
            <p><strong>Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr style="background-color: #f8f8f8;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Category</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Result</th>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Passed Tests</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #2e7d32;">${results.summary.passed}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Warnings</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #ed6c02;">${results.summary.warnings}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">Errors</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #d32f2f;">${results.summary.errors}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Issues</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"><strong>${results.summary.total}</strong></td>
              </tr>
            </table>
          </div>
          
          <h3>Detailed Results</h3>
      `;
      
      let detailedResults = '';
      
      const getTestName = (testKey: string) => {
        switch (testKey) {
          case 'htmlStructure': return 'HTML Structure';
          case 'ariaUsage': return 'ARIA Implementation';
          case 'colorContrast': return 'Color Contrast';
          case 'keyboardAccessibility': return 'Keyboard Accessibility';
          case 'formAccessibility': return 'Form Controls';
          default: return testKey;
        }
      };
      
      const getIssueTypeStyle = (type: string) => {
        switch (type) {
          case 'error': return 'color: #d32f2f;';
          case 'warning': return 'color: #ed6c02;';
          default: return 'color: #0288d1;';
        }
      };
      
      Object.entries(results.tests).forEach(([testKey, testResult]) => {
        detailedResults += `
          <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h4 style="margin-top: 0;">${getTestName(testKey)}</h4>
            ${testResult.passed 
              ? `<p style="color: #2e7d32;">✓ No issues detected in this category.</p>` 
              : `
                <p><strong>${testResult.issues.length} issue${testResult.issues.length !== 1 ? 's' : ''} found:</strong></p>
                <ul style="padding-left: 20px;">
                  ${testResult.issues.map(issue => `
                    <li style="margin-bottom: 10px;">
                      <div style="${getIssueTypeStyle(issue.type)}">
                        <strong>${issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}:</strong> 
                        ${issue.message}
                      </div>
                      <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        Code: ${issue.code}
                      </div>
                    </li>
                  `).join('')}
                </ul>
              `}
          </div>
        `;
      });
      
      const footerContent = `
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
          <p>Report generated by A11Y Checker on ${new Date().toLocaleString()}</p>
          <p>This report is based on automated testing and may not catch all accessibility issues.</p>
          <p>For complete WCAG compliance, combine with manual testing.</p>
        </div>
      `;
      
      reportDiv.innerHTML = reportContent + detailedResults + footerContent;
      
      // Create PDF using html2canvas and jsPDF
      const canvas = await html2canvas(reportDiv, {
        scale: 1.5, // Higher scale for better quality
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Calculate PDF dimensions based on aspect ratio
      const imgWidth = 210; // A4 width in mm (portrait)
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Split into multiple pages if content is too long
      let heightLeft = imgHeight;
      let position = 0;
      let pageCount = 1;
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = -pageHeight * pageCount;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageCount++;
      }
      
      // Save the PDF
      pdf.save(`a11y-report-${results.url.replace(/https?:\/\//g, '').replace(/[^\w]/g, '-')}.pdf`);
      
      // Clean up
      document.body.removeChild(reportDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <button 
      onClick={generatePdf} 
      className={styles.pdfButton}
      disabled={isGenerating}
      aria-label="Download accessibility report as PDF"
    >
      {isGenerating ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FontAwesomeIcon icon={faDownload} />
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  );
};

export default PdfReport; 