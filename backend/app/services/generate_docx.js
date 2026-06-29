const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageBreak } = require('docx');
const fs = require('fs');

// Get arguments
const jsonPath = process.argv[2];
const outputPath = process.argv[3];

// Read data
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Create document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" },
          size: 24
        }
      }
    },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" } },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0, keepNext: false, keepLines: false } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" } },
        paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1, keepNext: false, keepLines: false } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" } },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2, keepNext: false, keepLines: false } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    children: [
      // Cover Page
      new Paragraph({ spacing: { before: 2400 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ 
          text: "企业尽职调查报告", 
          bold: true, 
          size: 48,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      new Paragraph({ spacing: { before: 480 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ 
          text: data.companyName, 
          bold: true, 
          size: 36,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      new Paragraph({ spacing: { before: 480 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ 
          text: `报告生成时间：${data.generatedAt}`, 
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      new Paragraph({ spacing: { before: 240 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ 
          text: "本报告由智能尽调平台自动生成", 
          size: 20,
          color: "666666",
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ 
          text: "数据来源：企查查MCP + PaddleOCR-VL-1.6 + 智谱GLM-4.5-Flash", 
          size: 18,
          color: "999999",
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      
      // Page Break
      new Paragraph({ children: [new PageBreak()] }),
      
      // Executive Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("一、报告概要")] }),
      new Paragraph({
        spacing: { before: 180 },
        children: [new TextRun({
          text: "本尽职调查报告基于企查查企业信息、OCR解析的财务报表数据，以及AI大模型深度分析，全面评估企业的财务状况、经营风险和投资价值。",
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      
      // Section 1: Company Information
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("二、企业基本信息")] }),
      
      // Company Basic Info
      if (data.companyInfo && data.companyInfo.modules) {
        const basicInfo = data.companyInfo.modules.company?.basic_info || {};
        
        [
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 工商注册信息")] }),
          createInfoTable([
            ["企业名称", basicInfo.company_name || data.companyName],
            ["统一社会信用代码", basicInfo.credit_code || "—"],
            ["法定代表人", basicInfo.legal_person || "—"],
            ["注册资本", basicInfo.registered_capital || "—"],
            ["成立日期", basicInfo.establishment_date || "—"],
            ["企业类型", basicInfo.company_type || "—"],
            ["经营状态", basicInfo.status || "—"],
            ["所属行业", basicInfo.industry || "—"],
            ["注册地址", basicInfo.address || "—"],
          ])
        ]
      } else {
        [
          new Paragraph({ 
            spacing: { before: 180 },
            children: [new TextRun({ text: "企业基本信息暂无数据", size: 24, color: "666666" })] 
          })
        ]
      },
      
      // Risk Information
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 风险信息")] }),
      if (data.companyInfo?.modules?.risk) {
        const risk = data.companyInfo.modules.risk;
        [
          new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({
              text: `风险数量：${risk.risk_count || 0}`,
              size: 24,
              font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
            })]
          }),
          new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({
              text: risk.risk_summary || "未查询到明显风险信息",
              size: 24,
              font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
            })]
          })
        ]
      } else {
        [new Paragraph({ children: [new TextRun({ text: "风险信息暂无数据", size: 24, color: "666666" })] })]
      },
      
      // Section 2: Financial Analysis
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("三、财务数据分析")] }),
      if (data.aiAnalysis?.financial) {
        parseMarkdownToParagraphs(data.aiAnalysis.financial)
      } else {
        [new Paragraph({ children: [new TextRun({ text: "财务分析内容见OCR解析结果", size: 24 })] })]
      },
      
      // OCR Data Summary
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 PDF文档解析结果")] }),
      new Paragraph({
        spacing: { before: 120 },
        children: [new TextRun({
          text: `本次分析共处理 ${data.ocrResults?.documents?.length || 0} 个PDF文档，提取了 ${data.ocrResults?.tables?.length || 0} 个数据表格。`,
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      
      // Section 3: Risk Assessment
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("四、风险评估")] }),
      if (data.aiAnalysis?.risks) {
        parseMarkdownToParagraphs(data.aiAnalysis.risks)
      } else {
        [
          new Paragraph({
            children: [new TextRun({
              text: "风险等级：" + (data.aiAnalysis?.risk_level || "待评估"),
              size: 24,
              bold: true,
              font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
            })]
          })
        ]
      },
      
      // Section 4: Conclusion
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("五、结论与建议")] }),
      if (data.aiAnalysis?.conclusion) {
        parseMarkdownToParagraphs(data.aiAnalysis.conclusion)
      } else {
        [
          new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({
              text: "综合评分：" + (data.aiAnalysis?.score || "待评估"),
              size: 24,
              bold: true,
              font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
            })]
          }),
          new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({
              text: "建议进行更深入的尽职调查，获取更详细的财务和经营信息。",
              size: 24,
              font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
            })]
          })
        ]
      },
      
      // Appendix
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("六、附录")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 分析说明")] }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "企查查数据：通过企查查MCP接口获取的企业工商、风险、经营等信息",
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "OCR数据：通过PaddleOCR-VL-1.6从PDF文档中提取的财务数据和表格",
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      new Paragraph({
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun({
          text: "AI分析：基于智谱GLM-4.5-Flash大模型的深度分析和报告生成",
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 免责声明")] }),
      new Paragraph({
        spacing: { before: 120 },
        children: [new TextRun({
          text: "本报告由AI系统自动生成，仅供参考，不构成投资建议。投资决策应基于更全面的尽职调查和专业顾问意见。",
          size: 24,
          color: "666666",
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }),
    ].flat()
  }]
});

// Helper function to create info table
function createInfoTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [3500, 6500],
    rows: rows.map(([label, value]) => 
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            borders,
            width: { size: 3500, type: WidthType.DXA },
            shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({
                text: label,
                bold: true,
                size: 22,
                font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
              })]
            })]
          }),
          new TableCell({
            borders,
            width: { size: 6500, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({
                text: value,
                size: 22,
                font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
              })]
            })]
          })
        ]
      })
    )
  });
}

// Helper function to parse markdown-style content
function parseMarkdownToParagraphs(content) {
  if (!content) return [];
  
  const lines = content.split('\n');
  const paragraphs = [];
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    // Handle headers
    if (line.startsWith('###')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({
          text: line.replace(/^###\s*/, ''),
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }));
    } else if (line.startsWith('##')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({
          text: line.replace(/^##\s*/, ''),
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }));
    } else if (line.startsWith('#')) {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({
          text: line.replace(/^#\s*/, ''),
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }));
    } else {
      // Regular paragraph
      paragraphs.push(new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [new TextRun({
          text: line,
          size: 24,
          font: { ascii: "Arial", hAnsi: "Arial", eastAsia: "Microsoft YaHei" }
        })]
      }));
    }
  }
  
  return paragraphs;
}

// Generate document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated: ${outputPath}`);
}).catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});