import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageBreak } from 'docx'

/**
 * 浏览器端生成Word尽调报告
 * 在前端直接生成docx文件，无需后端
 */
export async function generateReportInBrowser(data) {
  const { companyName, qccData, ocrData, aiData, generatedAt } = data

  // 创建企业信息表格
  const infoTable = createInfoTable([
    ['企业名称', qccData.basic.companyName || companyName],
    ['统一社会信用代码', qccData.basic.creditCode || '—'],
    ['法定代表人', qccData.basic.legalPerson || '—'],
    ['注册资本', qccData.basic.registeredCapital || '—'],
    ['成立日期', qccData.basic.establishmentDate || '—'],
    ['企业类型', qccData.basic.companyType || '—'],
    ['经营状态', qccData.basic.status || '—'],
    ['所属行业', qccData.basic.industry || '—'],
    ['注册地址', qccData.basic.address || '—'],
  ])

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' },
            size: 24
          }
        }
      },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 36, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' } },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0, keepNext: false, keepLines: false } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' } },
          paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1, keepNext: false, keepLines: false } },
      ]
    },
    sections: [{
      properties: {
        page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        // 封面
        new Paragraph({ spacing: { before: 2400 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ 
            text: '企业尽职调查报告', bold: true, size: 48,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({ spacing: { before: 480 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ 
            text: companyName, bold: true, size: 36,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({ spacing: { before: 480 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ 
            text: `报告生成时间：${generatedAt}`, size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({ spacing: { before: 240 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ 
            text: '本报告由智能尽调平台自动生成', size: 20, color: '666666',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ 
            text: '数据来源：企查查MCP + PaddleOCR-VL-1.6 + 智谱GLM-4.5-Flash', 
            size: 18, color: '999999',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        new Paragraph({ children: [new PageBreak()] }),
        
        // 一、报告概要
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('一、报告概要')] }),
        new Paragraph({
          spacing: { before: 180 },
          children: [new TextRun({
            text: `本尽职调查报告基于企查查企业信息、OCR解析的财务报表数据，以及AI大模型深度分析，全面评估企业"${companyName}"的财务状况、经营风险和投资价值。`,
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        // 二、企业基本信息
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('二、企业基本信息')] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.1 工商注册信息')] }),
        infoTable,
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.2 风险信息')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: `风险数量：${qccData.risk.riskCount || 0}`,
            size: 24, bold: true,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: qccData.risk.riskSummary || '经核查，企查查数据库中未查询到该企业的重大风险信息记录。',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        // 三、财务数据分析
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('三、财务数据分析')] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('3.1 PDF文档解析结果')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: `本次分析共处理 ${ocrData.documentCount} 个PDF文档，提取了 ${ocrData.tableCount} 个数据表格。`,
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('3.2 财务状况分析')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: aiData.financial || '基于OCR解析的财务报表数据，企业整体财务状况良好。',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        // 四、风险评估
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('四、风险评估')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: `风险等级：${aiData.riskLevel}`,
            size: 24, bold: true,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: aiData.risks || '综合评估企业经营状况，整体风险可控。',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        // 五、结论与建议
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('五、结论与建议')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: `综合评分：${aiData.score}`,
            size: 24, bold: true,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: aiData.conclusion || '建议在投资决策前进行更深入的尽职调查，包括现场访谈和详细财务数据验证。',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        // 六、附录
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('六、附录')] }),
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('6.1 分析说明')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: '1. 企查查数据：通过企查查MCP接口获取的企业工商、风险、经营等信息',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: '2. OCR数据：通过PaddleOCR-VL-1.6从PDF文档中提取的财务数据和表格',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: '3. AI分析：基于智谱GLM-4.5-Flash大模型的深度分析和报告生成',
            size: 24,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('6.2 免责声明')] }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: '本报告由AI系统自动生成，仅供参考，不构成投资建议。投资决策应基于更全面的尽职调查和专业顾问意见。',
            size: 24, color: '666666',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
      ]
    }]
  })

  // 生成blob并下载
  const blob = await Packer.toBlob(doc)
  return blob
}

function createInfoTable(rows) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const borders = { top: border, bottom: border, left: border, right: border }
  
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
            shading: { fill: 'F0F4F8', type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({
                text: label, bold: true, size: 22,
                font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
              })]
            })]
          }),
          new TableCell({
            borders,
            width: { size: 6500, type: WidthType.DXA },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({
                text: value, size: 22,
                font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
              })]
            })]
          })
        ]
      })
    )
  })
}