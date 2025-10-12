// OCR and Text Extraction Utilities
'use client';

export type ExtractedContent = {
  text: string;
  fileName: string;
  fileType: string;
  confidence?: number;
};

// Extract text from images using Tesseract.js
export async function extractTextFromImage(file: File): Promise<ExtractedContent> {
  try {
    const Tesseract = await import('tesseract.js');
    
    const { data } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      text: data.text,
      fileName: file.name,
      fileType: file.type,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

// Extract text from PDF using pdf.js
export async function extractTextFromPDF(file: File): Promise<ExtractedContent> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n\n--- Page ${pageNum} ---\n${pageText}`;
    }

    return {
      text: fullText.trim(),
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from Word documents (basic text extraction)
export async function extractTextFromWord(file: File): Promise<ExtractedContent> {
  try {
    const mammoth = await import('mammoth');
    
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
      text: result.value,
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('Word extraction failed:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

// Extract text from plain text files
export async function extractTextFromTextFile(file: File): Promise<ExtractedContent> {
  try {
    const text = await file.text();

    return {
      text,
      fileName: file.name,
      fileType: file.type,
    };
  } catch (error) {
    console.error('Text file extraction failed:', error);
    throw new Error('Failed to read text file');
  }
}

// Main extraction function that routes to appropriate handler
export async function extractTextFromFile(file: File): Promise<ExtractedContent> {
  const fileType = file.type.toLowerCase();

  // Images - use OCR
  if (fileType.startsWith('image/')) {
    return extractTextFromImage(file);
  }

  // PDFs
  if (fileType === 'application/pdf') {
    return extractTextFromPDF(file);
  }

  // Word documents
  if (
    fileType === 'application/msword' ||
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractTextFromWord(file);
  }

  // Plain text files
  if (fileType === 'text/plain' || fileType === 'text/csv') {
    return extractTextFromTextFile(file);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

// Batch process multiple files
export async function extractTextFromMultipleFiles(
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<ExtractedContent[]> {
  const results: ExtractedContent[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }

    try {
      const extracted = await extractTextFromFile(file);
      results.push(extracted);
    } catch (error) {
      console.error(`Failed to extract from ${file.name}:`, error);
      // Continue with other files even if one fails
      results.push({
        text: `[Error: Could not extract text from ${file.name}]`,
        fileName: file.name,
        fileType: file.type,
      });
    }
  }

  return results;
}

// Create a synthesis prompt for multiple files
export function createSynthesisPrompt(extractedContents: ExtractedContent[]): string {
  let prompt = '**Uploaded Files Analysis:**\n\n';

  for (const content of extractedContents) {
    prompt += `**File: ${content.fileName}**\n`;
    prompt += `Type: ${content.fileType}\n`;
    if (content.confidence) {
      prompt += `OCR Confidence: ${Math.round(content.confidence)}%\n`;
    }
    prompt += `\nExtracted Content:\n${content.text}\n\n---\n\n`;
  }

  prompt += '\n**Task:** Analyze all uploaded files and create a comprehensive study guide that synthesizes the information.';

  return prompt;
}
