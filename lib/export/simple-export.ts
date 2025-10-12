// Simple Export Functions with AJ STUDIOZ// PDF and Word Export Utilities
'use client';

import jsPDF from 'jspdf';

export type ExportOptions = {
  title: string;
  content: string;
  author?: string;
  date?: Date;
};

// Export as PDF using jsPDF
export function exportToPDF(options: ExportOptions): void {
  try {
    const { title, content, date = new Date() } = options;
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = 30;

    // Perplexity-style centered header with logo
    const addHeader = () => {
      // Clean white background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, 50, 'F');
      
      // Centered logo area
      const logoX = pageWidth / 2;
      const logoY = 15;
      
      // Add AJ STUDIOZ logo image
      try {
        // Logo will be added via base64 - using the actual logo.jpg
        const logoSize = 20; // 20mm square logo
        doc.addImage('/logo.jpg', 'JPEG', logoX - logoSize/2, logoY - 5, logoSize, logoSize);
      } catch (e) {
        // Fallback to text logo if image fails
        doc.setFillColor(220, 38, 38); // Red background
        doc.rect(logoX - 10, logoY - 5, 20, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('AJ', logoX, logoY + 8, { align: 'center' });
      }
      
      // Brand name below logo
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AJ STUDIOZ', logoX, logoY + 22, { align: 'center' });
      
      // Separator line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, 48, pageWidth - margin, 48);
    };

    // Add header to first page
    addHeader();

    yPosition = 70;
    
    // Document Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, contentWidth);
    doc.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 10 + 5;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`, margin, yPosition);
    yPosition += 15;

    // Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        addHeader();
        yPosition = 70;
      }

      if (line.trim() === '') {
        yPosition += 5;
        continue;
      }

      // Handle headers and formatting
      if (line.startsWith('# ')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const text = line.substring(2).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '').trim();
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 8 + 3;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('## ')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const text = line.substring(3).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '').trim();
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 7 + 2;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('### ')) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const text = line.substring(4).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '').trim();
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 6 + 2;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const text = `• ${line.substring(2)}`;
        const textLines = doc.splitTextToSize(text, contentWidth - 5);
        doc.text(textLines, margin + 5, yPosition);
        yPosition += textLines.length * 6;
      } else {
        const textLines = doc.splitTextToSize(line, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 6;
      }
    }

    // Footer with page number
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    const filename = `${title.replace(/[^a-z0-9\s]/gi, '_').toLowerCase()}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
}

// Export as Word (HTML-based .doc format)
export function exportToWord(options: ExportOptions): void {
  const { title, content, date = new Date() } = options;
  
  // Convert markdown to HTML
  const htmlContent = markdownToHTML(content);
  
  // Create HTML document with Word-compatible formatting
  const wordHTML = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 2cm;
        }
        body {
          font-family: 'Calibri', sans-serif;
          font-size: 11pt;
          line-height: 1.6;
        }
        .header {
          background: white;
          text-align: center;
          padding: 30px 20px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
        }
        .logo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        .logo {
          background-color: #2563EB;
          color: white;
          width: 60px;
          height: 60px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 24pt;
          font-weight: bold;
          border-radius: 50%;
          position: relative;
        }
        .logo::before {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          background: #2563EB;
          border-radius: 50%;
          left: -15px;
        }
        .logo::after {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          background: #2563EB;
          border-radius: 50%;
          right: -15px;
        }
        .brand-name {
          color: #2563EB;
          font-size: 28pt;
          font-weight: bold;
          margin: 10px 0 5px 0;
        }
        .brand-tagline {
          color: #6b7280;
          font-size: 11pt;
          margin: 0;
        }
        .title {
          font-size: 18pt;
          font-weight: bold;
          margin: 20px 0 10px 0;
        }
        .date {
          color: #666;
          font-size: 10pt;
          font-style: italic;
          margin-bottom: 20px;
        }
        .content {
          margin: 20px 0;
        }
        h1 {
          font-size: 16pt;
          font-weight: bold;
          margin: 15px 0 10px 0;
          color: #333;
        }
        h2 {
          font-size: 14pt;
          font-weight: bold;
          margin: 12px 0 8px 0;
          color: #444;
        }
        h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 10px 0 6px 0;
          color: #555;
        }
        ul, ol {
          margin: 10px 0;
          padding-left: 30px;
        }
        li {
          margin: 5px 0;
        }
        p {
          margin: 8px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
          text-align: center;
          color: #999;
          font-size: 9pt;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <img src="/logo.jpg" alt="AJ STUDIOZ" style="width: 80px; height: 80px; object-fit: contain;" />
        </div>
        <h1 class="brand-name">AJ STUDIOZ</h1>
        <p class="brand-tagline">Student Learning Platform</p>
      </div>
      <div class="title">${title}</div>
      <div class="date">Generated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
      <hr>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        Generated by AJ STUDIOZ - Student Learning Platform
      </div>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([wordHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const filename = `${title.replace(/[^a-z0-9\s]/gi, '_').toLowerCase()}.doc`;
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Simple markdown to HTML converter
function markdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Remove emojis for cleaner Word output
  html = html.replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Lists
  const lines = html.split('\n');
  let inList = false;
  const processedLines: string[] = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      processedLines.push(`<li>${line.trim().substring(2)}</li>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (line.trim()) {
        processedLines.push(`<p>${line}</p>`);
      }
    }
  }
  
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('\n');
}
