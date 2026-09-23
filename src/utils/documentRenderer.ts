import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer
} from 'docx';

export interface DocumentSection {
  title: string;
  paragraphs: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface DocumentSignature {
  role: string;
  name?: string;
  details?: string[];
}

export interface LegalDocumentModel {
  title: string;
  subtitle?: string;
  headerRight?: string[]; // E.g., for Arizalar: Kimga, Kimdan
  city?: string;
  date?: string;
  preamble?: string;
  sections: DocumentSection[];
  signatures?: DocumentSignature[];
  disclaimer?: string;
  notices?: string[];
}

const MONTH_NAMES_UZ = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr'
];

/**
 * Formats a date string or current date into standard formal Uzbek format.
 * E.g. "19 sentyabr 2026-yil"
 */
export function formatUzbekDate(dateStr?: string): string {
  let d = new Date();
  if (dateStr && dateStr.trim()) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      d = parsed;
    }
  }
  const day = d.getDate();
  const month = MONTH_NAMES_UZ[d.getMonth()] || 'oy';
  const year = d.getFullYear();
  return `${day} ${month} ${year}-yil`;
}

/**
 * Formats monetary amounts with thousand separators.
 * E.g. "2 500 000 so‘m"
 */
export function formatMoney(amount?: string | number): string {
  if (amount === undefined || amount === null || amount === '') {
    return '_______________________________ so‘m';
  }
  const clean = String(amount).replace(/[^\d.]/g, '');
  const num = parseFloat(clean);
  if (isNaN(num)) {
    return `${amount} so‘m`;
  }
  const formatted = num.toLocaleString('uz-UZ').replace(/[\s\u00a0\u202f,]+/g, ' ');
  return `${formatted} so‘m`;
}

/**
 * Safely cleans user input. If empty, returns a clean formal blank line.
 * Never outputs null, undefined, or template syntax.
 */
export function cleanField(val?: string, placeholder = '_______________________________'): string {
  if (val === undefined || val === null) {
    return placeholder;
  }
  const trimmed = String(val).trim();
  if (!trimmed) {
    return placeholder;
  }
  // Remove any stray template braces or variable prefixes if someone entered them
  const sanitized = trimmed.replace(/\$\{[^}]+\}/g, '').replace(/d\.[a-zA-Z0-9_]+/g, '');
  return sanitized.trim() || placeholder;
}

/**
 * Checks if a field is provided by the user.
 */
export function hasValue(val?: string): boolean {
  if (!val) return false;
  const trimmed = String(val).trim();
  return trimmed.length > 0 && !trimmed.startsWith('___');
}

/**
 * Converts a LegalDocumentModel into a professionally formatted plain text representation.
 */
export function renderToPlainText(model: LegalDocumentModel): string {
  const lines: string[] = [];

  // Header Right (for petitions, complaints, applications)
  if (model.headerRight && model.headerRight.length > 0) {
    for (const h of model.headerRight) {
      if (h.trim()) {
        lines.push(`                                        ${h.trim()}`);
      }
    }
    lines.push('');
  }

  // Title
  lines.push(model.title.toUpperCase());
  if (model.subtitle) {
    lines.push(model.subtitle);
  }
  lines.push('');

  // Location and Date bar
  if (model.city || model.date) {
    const loc = model.city ? model.city.trim() : '_________________';
    const dt = model.date ? model.date.trim() : formatUzbekDate();
    lines.push(`${loc.padEnd(45, ' ')}${dt}`);
    lines.push('');
  }

  // Preamble
  if (model.preamble) {
    lines.push(model.preamble.trim());
    lines.push('');
  }

  // Sections
  for (const sec of model.sections) {
    if (sec.title) {
      lines.push(sec.title);
      lines.push('');
    }
    for (const p of sec.paragraphs) {
      if (p.trim()) {
        lines.push(`  ${p.trim()}`);
        lines.push('');
      }
    }
    if (sec.table) {
      lines.push(`  [ ${sec.table.headers.join(' | ')} ]`);
      for (const row of sec.table.rows) {
        lines.push(`  | ${row.join(' | ')} |`);
      }
      lines.push('');
    }
  }

  // Signatures
  if (model.signatures && model.signatures.length > 0) {
    lines.push('------------------------------------------------------------');
    lines.push('TARAFLARNING REKVIZITLARI VA IMZOLARI:');
    lines.push('');

    for (const sig of model.signatures) {
      lines.push(`[${sig.role}]`);
      if (sig.name) {
        lines.push(`F.I.Sh.: ${sig.name}`);
      } else {
        lines.push('F.I.Sh.: _______________________________');
      }
      if (sig.details && sig.details.length > 0) {
        for (const det of sig.details) {
          lines.push(`${det}`);
        }
      }
      lines.push('Imzo: _______________________________');
      lines.push('');
    }
  }

  // Disclaimer
  if (model.disclaimer) {
    lines.push('------------------------------------------------------------');
    lines.push(`Huquqiy eslatma: ${model.disclaimer}`);
  }

  return lines.join('\n');
}

/**
 * Builds and downloads a real Microsoft Word (.docx) document from a LegalDocumentModel.
 */
export async function exportToDocx(model: LegalDocumentModel, filename = 'Hujjat_AdvokatAI'): Promise<void> {
  const docChildren: (Paragraph | Table)[] = [];

  // Header Right (Shapka for applications)
  if (model.headerRight && model.headerRight.length > 0) {
    for (const line of model.headerRight) {
      if (line.trim()) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 80, line: 280 },
            children: [
              new TextRun({
                text: line.trim(),
                font: 'Times New Roman',
                size: 22, // 11pt
                italics: true
              })
            ]
          })
        );
      }
    }
    docChildren.push(new Paragraph({ spacing: { after: 200 } }));
  }

  // Document Title
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: model.title.toUpperCase(),
          font: 'Times New Roman',
          size: 28, // 14pt
          bold: true
        })
      ]
    })
  );

  if (model.subtitle) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: model.subtitle,
            font: 'Times New Roman',
            size: 22,
            italics: true
          })
        ]
      })
    );
  }

  // Location and Date Line
  if (model.city || model.date) {
    const locText = model.city ? model.city.trim() : '_________________';
    const dateText = model.date ? model.date.trim() : formatUzbekDate();

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: locText,
                        font: 'Times New Roman',
                        size: 24,
                        bold: true
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: dateText,
                        font: 'Times New Roman',
                        size: 24,
                        bold: true
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      })
    );
    docChildren.push(new Paragraph({ spacing: { after: 200 } }));
  }

  // Preamble
  if (model.preamble) {
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 720 }, // 0.5 inch indent
        spacing: { after: 160, line: 360 }, // 1.5 line spacing
        children: [
          new TextRun({
            text: model.preamble.trim(),
            font: 'Times New Roman',
            size: 24 // 12pt
          })
        ]
      })
    );
  }

  // Sections
  for (const sec of model.sections) {
    if (sec.title) {
      docChildren.push(
        new Paragraph({
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: sec.title,
              font: 'Times New Roman',
              size: 24,
              bold: true
            })
          ]
        })
      );
    }

    for (const p of sec.paragraphs) {
      if (p.trim()) {
        docChildren.push(
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            indent: { firstLine: 720 },
            spacing: { after: 120, line: 320 },
            children: [
              new TextRun({
                text: p.trim(),
                font: 'Times New Roman',
                size: 24
              })
            ]
          })
        );
      }
    }

    if (sec.table && sec.table.headers.length > 0) {
      const headerRow = new TableRow({
        tableHeader: true,
        children: sec.table.headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: h, bold: true, font: 'Times New Roman', size: 22 })]
                })
              ]
            })
        )
      });

      const bodyRows = sec.table.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: cell, font: 'Times New Roman', size: 22 })]
                    })
                  ]
                })
            )
          })
      );

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...bodyRows]
        })
      );
      docChildren.push(new Paragraph({ spacing: { after: 200 } }));
    }
  }

  // Signatures
  if (model.signatures && model.signatures.length > 0) {
    docChildren.push(new Paragraph({ spacing: { before: 300, after: 140 } }));

    if (model.signatures.length === 2) {
      // 2 columns side-by-side
      const s1 = model.signatures[0];
      const s2 = model.signatures[1];

      const p1Children: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: s1.role, bold: true, font: 'Times New Roman', size: 22 })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `F.I.Sh.: ${s1.name || '__________________________'}`,
              font: 'Times New Roman',
              size: 22
            })
          ]
        })
      ];
      if (s1.details) {
        for (const d of s1.details) {
          p1Children.push(
            new Paragraph({
              children: [new TextRun({ text: d, font: 'Times New Roman', size: 20 })]
            })
          );
        }
      }
      p1Children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({ text: 'Imzo: _____________________', font: 'Times New Roman', size: 22 })]
        })
      );

      const p2Children: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: s2.role, bold: true, font: 'Times New Roman', size: 22 })]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `F.I.Sh.: ${s2.name || '__________________________'}`,
              font: 'Times New Roman',
              size: 22
            })
          ]
        })
      ];
      if (s2.details) {
        for (const d of s2.details) {
          p2Children.push(
            new Paragraph({
              children: [new TextRun({ text: d, font: 'Times New Roman', size: 20 })]
            })
          );
        }
      }
      p2Children.push(
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({ text: 'Imzo: _____________________', font: 'Times New Roman', size: 22 })]
        })
      );

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: p1Children
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: p2Children
                })
              ]
            })
          ]
        })
      );
    } else {
      // 1 column signature stack
      for (const sig of model.signatures) {
        docChildren.push(
          new Paragraph({
            spacing: { before: 140, after: 60 },
            children: [new TextRun({ text: sig.role, bold: true, font: 'Times New Roman', size: 24 })]
          })
        );
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `F.I.Sh.: ${sig.name || '_______________________________'}`,
                font: 'Times New Roman',
                size: 24
              })
            ]
          })
        );
        if (sig.details) {
          for (const d of sig.details) {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: d, font: 'Times New Roman', size: 22 })]
              })
            );
          }
        }
        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 200 },
            children: [new TextRun({ text: 'Imzo: _______________________________', font: 'Times New Roman', size: 24 })]
          })
        );
      }
    }
  }

  // Legal Disclaimer footnote
  if (model.disclaimer) {
    docChildren.push(
      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: `Huquqiy eslatma: ${model.disclaimer}`,
            font: 'Times New Roman',
            size: 18, // 9pt
            italics: true
          })
        ]
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440
            }
          }
        },
        children: docChildren
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean browser print dialog formatted for A4 legal printing.
 */
export function printLegalDocument(elementId: string): void {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="uz">
      <head>
        <meta charset="utf-8" />
        <title>AdvokatAI - Hujjat</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 15mm;
          }
          body {
            font-family: "Times New Roman", Times, serif;
            color: #111;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 13pt;
            line-height: 1.5;
          }
          h1, h2, h3, h4 {
            font-family: "Times New Roman", Times, serif;
            color: #000;
            margin-top: 14pt;
            margin-bottom: 8pt;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-justify { text-align: justify; }
          .font-bold { font-weight: bold; }
          .italic { font-style: italic; }
          .indent { text-indent: 1.25cm; }
          .signature-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 30pt;
            page-break-inside: avoid;
          }
          .signature-col {
            width: 48%;
          }
          .disclaimer {
            font-size: 9pt;
            color: #555;
            font-style: italic;
            border-top: 1px solid #ccc;
            padding-top: 10pt;
            margin-top: 30pt;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${el.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
