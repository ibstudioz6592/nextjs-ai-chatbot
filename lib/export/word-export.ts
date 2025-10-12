// Word Document Export with AJ STUDIOZ Branding - Client-side only
'use client';

export type ExportOptions = {
  title: string;
  content: string;
  author?: string;
  date?: Date;
};

export async function exportToWord(options: ExportOptions): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import('docx');
  
  const doc = await createWordDocument(options, { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle });
  const filename = `${options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.docx`;
  
  // Save the file
  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function createWordDocument(options: ExportOptions, docx: any): Promise<any> {
  const { title, content, author = 'AJ STUDIOZ', date = new Date() } = options;

  const paragraphs: Paragraph[] = [];

  // Header with branding
  paragraphs.push(
    new Paragraph({
      text: 'AJ STUDIOZ',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      border: {
        bottom: {
          color: '2563EB',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 24,
        },
      },
    })
  );

  paragraphs.push(
    new Paragraph({
      text: 'Student Learning Assistant',
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      style: 'subtitle',
    })
  );

  // Document Title
  paragraphs.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  // Date
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
          italics: true,
          color: '666666',
          size: 20,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Process content
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.trim() === '') {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
      continue;
    }

    // Handle headers
    if (line.startsWith('# ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/g, '').trim(),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(3).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/g, '').trim(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 100 },
        })
      );
    } else if (line.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(4).replace(/[🎯📝🔍💡📊⚡✅🎓💻🚀⭐]/g, '').trim(),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 100, after: 50 },
        })
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          bullet: { level: 0 },
          spacing: { after: 50 },
        })
      );
    } else if (/^\d+\.\s/.test(line)) {
      paragraphs.push(
        new Paragraph({
          text: line.replace(/^\d+\.\s/, ''),
          numbering: { reference: 'default-numbering', level: 0 },
          spacing: { after: 50 },
        })
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Bold text
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/\*\*/g, ''),
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );
    } else if (line.startsWith('> ')) {
      // Blockquote
      paragraphs.push(
        new Paragraph({
          text: line.substring(2),
          italics: true,
          indent: { left: 720 },
          spacing: { after: 100 },
          border: {
            left: {
              color: '2563EB',
              space: 1,
              style: BorderStyle.SINGLE,
              size: 12,
            },
          },
        })
      );
    } else {
      // Regular text - handle inline formatting
      const children: TextRun[] = [];
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/);
      
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          children.push(new TextRun({ text: part.slice(2, -2), bold: true }));
        } else if (part.startsWith('*') && part.endsWith('*')) {
          children.push(new TextRun({ text: part.slice(1, -1), italics: true }));
        } else if (part.startsWith('`') && part.endsWith('`')) {
          children.push(new TextRun({ text: part.slice(1, -1), font: 'Courier New' }));
        } else if (part) {
          children.push(new TextRun({ text: part }));
        }
      }

      paragraphs.push(
        new Paragraph({
          children: children.length > 0 ? children : [new TextRun({ text: line })],
          spacing: { after: 100 },
        })
      );
    }
  }

  // Footer with watermark
  paragraphs.push(
    new Paragraph({
      text: '',
      spacing: { before: 400 },
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '━'.repeat(50),
          color: 'CCCCCC',
        }),
      ],
    })
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Generated by AJ STUDIOZ - Student Learning Platform',
          italics: true,
          color: '999999',
          size: 18,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100 },
    })
  );

  // Create document
  const doc = new Document({
    creator: author,
    title: title,
    description: 'Generated by AJ STUDIOZ Student Learning Platform',
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.docx`;
  saveAs(blob, filename);
}
