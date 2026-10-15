import { NoteItem, Folder } from '../types/note';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType } from 'docx';

export const exportService = {
  /**
   * Export Note as DOCX using docx library
   */
  async exportToDocx(note: NoteItem): Promise<void> {
    const docChildren: any[] = [];

    // Title
    docChildren.push(
      new Paragraph({
        text: note.title || 'Untitled Note',
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 }
      })
    );

    // Meta info
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Created: ${new Date(note.createdAt).toLocaleString()} | Tags: ${note.tags.join(', ') || 'None'}`,
            italics: true,
            color: '666666',
            size: 20
          })
        ],
        spacing: { after: 300 }
      })
    );

    // Blocks
    for (const block of note.blocks) {
      if (block.type === 'h1') {
        docChildren.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 }
          })
        );
      } else if (block.type === 'h2') {
        docChildren.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 180, after: 80 }
          })
        );
      } else if (block.type === 'h3') {
        docChildren.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 60 }
          })
        );
      } else if (block.type === 'h4') {
        docChildren.push(
          new Paragraph({
            text: block.content,
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 140, after: 40 }
          })
        );
      } else if (block.type === 'bullet') {
        docChildren.push(
          new Paragraph({
            text: `• ${block.content}`,
            bullet: { level: 0 },
            spacing: { after: 60 }
          })
        );
      } else if (block.type === 'number') {
        docChildren.push(
          new Paragraph({
            text: block.content,
            spacing: { after: 60 }
          })
        );
      } else if (block.type === 'task') {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: block.checked ? '[x] ' : '[ ] ',
                bold: true
              }),
              new TextRun({
                text: block.content,
                strike: block.checked
              })
            ],
            spacing: { after: 60 }
          })
        );
      } else if (block.type === 'quote' || block.type === 'callout') {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${block.type === 'callout' ? '💡 ' : '"'}${block.content}${block.type === 'quote' ? '"' : ''}`,
                italics: true
              })
            ],
            indent: { left: 720 },
            spacing: { before: 100, after: 100 }
          })
        );
      } else if (block.type === 'table' && block.tableData) {
        const rows: TableRow[] = [];
        // Header row
        if (block.tableData.headers?.length) {
          rows.push(
            new TableRow({
              children: block.tableData.headers.map(
                (h) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })],
                    width: { size: 100 / block.tableData!.headers.length, type: WidthType.PERCENTAGE }
                  })
              )
            })
          );
        }
        // Body rows
        for (const row of block.tableData.rows || []) {
          rows.push(
            new TableRow({
              children: row.map(
                (cell) =>
                  new TableCell({
                    children: [new Paragraph({ text: cell })],
                    width: { size: 100 / row.length, type: WidthType.PERCENTAGE }
                  })
              )
            })
          );
        }
        if (rows.length > 0) {
          docChildren.push(new Table({ rows }));
        }
      } else if (block.type === 'timeline' && block.timelineEvents) {
        docChildren.push(
          new Paragraph({
            text: 'Project Timeline & Milestones',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 180, after: 80 }
          })
        );
        for (const ev of block.timelineEvents) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({ text: `[${ev.date}] `, bold: true }),
                new TextRun({ text: `${ev.title} (${ev.status.toUpperCase()}): `, bold: true }),
                new TextRun({ text: ev.description || '' })
              ],
              spacing: { after: 40 }
            })
          );
        }
      } else if (block.type === 'image') {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Image: ${block.imageCaption || block.imageUrl || 'Attached image'}]`,
                italics: true
              })
            ],
            spacing: { before: 100, after: 100 }
          })
        );
      } else if (block.type === 'link-to-page') {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `🔗 Linked Note Reference [ID: ${block.linkedNoteId || 'None'}]`,
                italics: true,
                color: '2563EB'
              })
            ],
            spacing: { after: 60 }
          })
        );
      } else if (block.type === 'webview') {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `🌐 Embedded Web View: ${block.url || 'No URL specified'}`,
                color: '0891B2'
              })
            ],
            spacing: { after: 60 }
          })
        );
      } else if (block.type === 'divider') {
        docChildren.push(
          new Paragraph({
            text: '____________________________________________________',
            spacing: { before: 100, after: 100 }
          })
        );
      } else {
        docChildren.push(
          new Paragraph({
            text: block.content || '',
            spacing: { after: 100 }
          })
        );
      }
    }

    // Canvas elements summary if any
    if (note.canvasElements && note.canvasElements.length > 0) {
      docChildren.push(
        new Paragraph({
          text: 'Canvas Elements & Diagrams',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 }
        })
      );
      for (const el of note.canvasElements) {
        if (el.content) {
          docChildren.push(
            new Paragraph({
              text: `[${el.type.toUpperCase()}${el.shapeType ? ` - ${el.shapeType}` : ''}] ${el.content}`,
              spacing: { after: 60 }
            })
          );
        }
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children: docChildren }]
    });

    const blob = await Packer.toBlob(doc);
    const filename = `${(note.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    saveBlobAs(blob, filename);
  },

  /**
   * Export Note as JSON
   */
  exportToJson(note: NoteItem): void {
    const dataStr = JSON.stringify(note, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const filename = `${(note.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    saveBlobAs(blob, filename);
  },

  /**
   * Export entire Vault backup (all notes and folders)
   */
  exportVaultBackup(notes: NoteItem[], folders: Folder[]): void {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      folders,
      notes
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const dateStr = new Date().toISOString().split('T')[0];
    saveBlobAs(blob, `omninotes_vault_backup_${dateStr}.json`);
  },

  /**
   * Export Note as Markdown
   */
  exportToMarkdown(note: NoteItem): void {
    let md = `# ${note.title || 'Untitled'}\n\n`;
    if (note.tags.length > 0) {
      md += `> Tags: ${note.tags.map((t) => `#${t}`).join(' ')}\n\n`;
    }

    for (const block of note.blocks) {
      switch (block.type) {
        case 'h1':
          md += `# ${block.content}\n\n`;
          break;
        case 'h2':
          md += `## ${block.content}\n\n`;
          break;
        case 'h3':
          md += `### ${block.content}\n\n`;
          break;
        case 'h4':
          md += `#### ${block.content}\n\n`;
          break;
        case 'bullet':
          md += `- ${block.content}\n`;
          break;
        case 'number':
          md += `1. ${block.content}\n`;
          break;
        case 'task':
          md += `- [${block.checked ? 'x' : ' '}] ${block.content}\n`;
          break;
        case 'quote':
          md += `> ${block.content}\n\n`;
          break;
        case 'callout':
          md += `> 💡 **Callout**: ${block.content}\n\n`;
          break;
        case 'code':
          md += `\`\`\`${block.language || ''}\n${block.content}\n\`\`\`\n\n`;
          break;
        case 'equation':
          md += `$$\n${block.content}\n$$\n\n`;
          break;
        case 'divider':
          md += `---\n\n`;
          break;
        case 'table':
          if (block.tableData) {
            md += `| ${block.tableData.headers.join(' | ')} |\n`;
            md += `| ${block.tableData.headers.map(() => '---').join(' | ')} |\n`;
            for (const row of block.tableData.rows) {
              md += `| ${row.join(' | ')} |\n`;
            }
            md += '\n';
          }
          break;
        case 'timeline':
          if (block.timelineEvents) {
            md += `### Project Timeline & Milestones\n\n`;
            for (const ev of block.timelineEvents) {
              md += `- **[${ev.date}]** ${ev.title} (${ev.status.toUpperCase()}): ${ev.description}\n`;
            }
            md += '\n';
          }
          break;
        case 'image':
          md += `![${block.imageCaption || 'image'}](${block.imageUrl || ''})\n\n`;
          break;
        case 'link-to-page':
          md += `🔗 [Linked Note (ID: ${block.linkedNoteId})]\n\n`;
          break;
        case 'webview':
          md += `🌐 [Web View: ${block.url}](${block.url})\n\n`;
          break;
        default:
          md += `${block.content}\n\n`;
      }
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const filename = `${(note.title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    saveBlobAs(blob, filename);
  },

  /**
   * High-fidelity print / PDF Export
   */
  exportToPdf(note: NoteItem): void {
    // Open a formatted print window with custom print styles
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${note.title || 'Note Export'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1a1a1a;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
            }
            h1 { font-size: 28px; margin-bottom: 8px; border-bottom: 2px solid #E5A93C; padding-bottom: 8px; }
            h2 { font-size: 22px; margin-top: 24px; margin-bottom: 8px; }
            h3 { font-size: 18px; margin-top: 18px; margin-bottom: 6px; }
            .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
            .tag { background: #eee; padding: 2px 8px; border-radius: 12px; margin-right: 6px; font-size: 12px; }
            .callout { background: #fef9c3; border-left: 4px solid #facc15; padding: 12px 16px; border-radius: 6px; margin: 14px 0; }
            blockquote { border-left: 3px solid #ccc; margin: 12px 0; padding-left: 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
            th { background-color: #f8f8f8; }
            .task-done { text-decoration: line-through; color: #888; }
            .timeline-event { border-left: 2px solid #10B981; padding-left: 12px; margin: 10px 0; }
            hr { border: none; border-top: 1px solid #e5e5e5; margin: 20px 0; }
            @media print {
              body { margin: 0; padding: 15mm; }
            }
          </style>
        </head>
        <body>
          <h1>${note.title || 'Untitled Note'}</h1>
          <div class="meta">
            Created: ${new Date(note.createdAt).toLocaleString()} | 
            Tags: ${note.tags.map((t) => `<span class="tag">#${t}</span>`).join(' ') || 'None'}
          </div>
          <div class="content">
            ${note.blocks
              .map((b) => {
                if (b.type === 'h1') return `<h1>${b.content}</h1>`;
                if (b.type === 'h2') return `<h2>${b.content}</h2>`;
                if (b.type === 'h3') return `<h3>${b.content}</h3>`;
                if (b.type === 'h4') return `<h4>${b.content}</h4>`;
                if (b.type === 'bullet') return `<li>${b.content}</li>`;
                if (b.type === 'number') return `<div>1. ${b.content}</div>`;
                if (b.type === 'task')
                  return `<div><input type="checkbox" ${b.checked ? 'checked' : ''} disabled/> <span class="${b.checked ? 'task-done' : ''}">${b.content}</span></div>`;
                if (b.type === 'quote') return `<blockquote>${b.content}</blockquote>`;
                if (b.type === 'callout') return `<div class="callout">💡 ${b.content}</div>`;
                if (b.type === 'divider') return `<hr/>`;
                if (b.type === 'table' && b.tableData) {
                  return `<table><thead><tr>${b.tableData.headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${b.tableData.rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
                }
                if (b.type === 'timeline' && b.timelineEvents) {
                  return `<div style="margin: 16px 0;"><h3>Timeline</h3>${b.timelineEvents.map((ev) => `<div class="timeline-event"><strong>${ev.date} - ${ev.title} (${ev.status})</strong><p>${ev.description}</p></div>`).join('')}</div>`;
                }
                if (b.type === 'image' && b.imageUrl) {
                  return `<div style="margin: 14px 0;"><img src="${b.imageUrl}" style="max-width: 100%; border-radius: 6px;"/><p style="font-size: 12px; color: #666; text-align: center;">${b.imageCaption || ''}</p></div>`;
                }
                if (b.type === 'link-to-page') {
                  return `<p>🔗 <em>Linked Note [ID: ${b.linkedNoteId || ''}]</em></p>`;
                }
                if (b.type === 'webview') {
                  return `<p>🌐 <em>Web View Embed: <a href="${b.url}">${b.url}</a></em></p>`;
                }
                return `<p>${b.content || ''}</p>`;
              })
              .join('')}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

function saveBlobAs(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
