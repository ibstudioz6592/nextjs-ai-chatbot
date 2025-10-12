// PDF and Word Export Utilities
'use client';

import jsPDF from 'jspdf';

// Base64 encoded logo (will be loaded from public/logo.jpg)
let logoBase64: string | null = null;

// Load logo as base64
if (typeof window !== 'undefined') {
  fetch('/logo.jpg')
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64 = reader.result as string;
      };
      reader.readAsDataURL(blob);
    })
    .catch(() => {
      console.log('Logo not loaded, will use fallback');
    });
}

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

    // Stylish header with circular logo
    const addHeader = (pageNum: number) => {
      // Gradient-style background (light to lighter)
      doc.setFillColor(250, 251, 252);
      doc.rect(0, 0, pageWidth, 38, 'F');
      
      // Logo on left - CIRCULAR
      const logoX = 18;
      const logoY = 12;
      const logoSize = 14;
      
      // Circular white background for logo
      doc.setFillColor(255, 255, 255);
      doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 1, 'F');
      
      // Circular shadow/border
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 + 1, 'S');
      
      // Add logo image if available (circular clip)
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'JPEG', logoX, logoY, logoSize, logoSize);
        } catch {
          // Fallback: Red circle with AJ
          doc.setFillColor(220, 38, 38);
          doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('AJ', logoX + logoSize/2, logoY + logoSize/2 + 3, { align: 'center' });
        }
      } else {
        // Fallback: Red circle with AJ
        doc.setFillColor(220, 38, 38);
        doc.circle(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('AJ', logoX + logoSize/2, logoY + logoSize/2 + 3, { align: 'center' });
      }
      
      // Brand name next to logo (elegant styling)
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('AJ STUDIOZ', logoX + logoSize + 8, logoY + 9);
      
      // Elegant separator line with gradient effect
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, 36, pageWidth - margin, 36);
      
      // Decorative accent line (blue)
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(1);
      doc.line(margin, 37, margin + 30, 37);
      
      // Page number on right (elegant styling)
      if (pageNum > 0) {
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${pageNum}`, pageWidth - 20, logoY + 9, { align: 'right' });
      }
    };

    // Add header to first page
    addHeader(1);

    yPosition = 50;
    
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
    
    let pageNum = 1;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeLanguage = '';
    
    for (const line of lines) {
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        yPosition = 50;
        // Reset text color after new page
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      }

      // Handle code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          // Start code block
          inCodeBlock = true;
          codeLanguage = line.substring(3).trim();
          codeBlockLines = [];
          continue;
        } else {
          // End code block - render it
          inCodeBlock = false;
          
          // Draw code block background
          const codeHeight = codeBlockLines.length * 5 + 10;
          doc.setFillColor(245, 245, 245);
          doc.roundedRect(margin, yPosition - 3, contentWidth, codeHeight, 2, 2, 'F');
          
          // Draw border
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.roundedRect(margin, yPosition - 3, contentWidth, codeHeight, 2, 2, 'S');
          
          // Language label
          if (codeLanguage) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('courier', 'bold');
            doc.text(codeLanguage.toUpperCase(), margin + 3, yPosition + 1);
            yPosition += 6;
          } else {
            yPosition += 3;
          }
          
          // Render code lines
          doc.setFontSize(9);
          doc.setTextColor(40, 40, 40);
          doc.setFont('courier', 'normal');
          
          for (const codeLine of codeBlockLines) {
            const codeTextLines = doc.splitTextToSize(codeLine || ' ', contentWidth - 10);
            doc.text(codeTextLines, margin + 5, yPosition);
            yPosition += codeTextLines.length * 5;
          }
          
          yPosition += 7;
          
          // Reset formatting
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          
          codeBlockLines = [];
          codeLanguage = '';
          continue;
        }
      }
      
      // If inside code block, collect lines
      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }
      
      if (line.trim() === '') {
        yPosition += 5;
        continue;
      }

      // Handle headers and formatting
      if (line.startsWith('# ')) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const text = line.substring(2).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '').trim();
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 9 + 5;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('## ')) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const text = line.substring(3).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '').trim();
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 7 + 4;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('### ')) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        const text = line.substring(4).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/gu, '').trim();
        const textLines = doc.splitTextToSize(text, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 6 + 3;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        doc.setTextColor(0, 0, 0);
        const text = `• ${line.substring(2)}`;
        const textLines = doc.splitTextToSize(text, contentWidth - 5);
        doc.text(textLines, margin + 5, yPosition);
        yPosition += textLines.length * 6 + 1;
      } else {
        doc.setTextColor(0, 0, 0);
        const textLines = doc.splitTextToSize(line, contentWidth);
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 6 + 1;
      }
    }

    // Add stylish footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer separator line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Generated by AJ STUDIOZ - AN Growing Technologies Company', pageWidth / 2, pageHeight - 12, { align: 'center' });
      
      // Page number (right side)
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(`${i} of ${totalPages}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
      
      // Small decorative element (left side)
      doc.setFillColor(37, 99, 235);
      doc.circle(margin + 2, pageHeight - 12, 1, 'F');
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
          background: linear-gradient(to bottom, #fafbfc 0%, #ffffff 100%);
          padding: 20px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 15px;
          border-bottom: 2px solid #e5e7eb;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 20px;
          width: 60px;
          height: 3px;
          background: #2563EB;
        }
        .logo-container {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 2px solid #e5e7eb;
        }
        .logo-container img {
          width: 90%;
          height: 90%;
          object-fit: contain;
          border-radius: 50%;
        }
        .brand-info {
          flex: 1;
        }
        .brand-name {
          color: #1e1e1e;
          font-size: 22pt;
          font-weight: bold;
          margin: 0;
          letter-spacing: 0.5px;
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
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 9pt;
          font-style: normal;
          position: relative;
        }
        .footer::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 0;
          width: 60px;
          height: 2px;
          background: #2563EB;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-container">
          <img src="/logo.jpg" alt="AJ STUDIOZ" />
        </div>
        <div class="brand-info">
          <h1 class="brand-name">AJ STUDIOZ</h1>
        </div>
      </div>
      <div class="title">${title}</div>
      <div class="date">Generated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
      <hr>
      <div class="content">
        ${htmlContent}
      </div>
      <div class="footer">
        Generated by AJ STUDIOZ - AN Growing Technologies Company
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
