import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageBreak } from 'docx'

/**
 * 将Markdown格式的AI报告转换为Word文档
 * @param {string} companyName - 企业名称
 * @param {string} markdownContent - AI生成的Markdown报告
 * @param {Object} metadata - 报告元数据
 * @returns {Promise<Blob>} Word文档Blob
 */
export async function generateReportFromMarkdown(companyName, markdownContent, metadata = {}) {
  const generatedAt = metadata.generatedAt || new Date().toLocaleString('zh-CN')
  
  // 解析Markdown
  const blocks = parseMarkdown(markdownContent)
  
  // 构建Word文档
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
          run: { size: 32, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' } },
          paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0, keepNext: false, keepLines: false } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 28, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' } },
          paragraph: { spacing: { before: 240, after: 180 }, outlineLevel: 1, keepNext: false, keepLines: false } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 24, bold: true, font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' } },
          paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2, keepNext: false, keepLines: false } },
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
            text: 'AI模型：智谱GLM-4.5-Flash', size: 18, color: '999999',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ 
            text: '数据来源：企查查MCP + PaddleOCR-VL-1.6', 
            size: 18, color: '999999',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        
        new Paragraph({ children: [new PageBreak()] }),
        
        // AI生成的报告内容
        ...blocks,
        
        // 免责声明页
        new Paragraph({ children: [new PageBreak()] }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('免责声明')] }),
        new Paragraph({
          spacing: { before: 180 },
          children: [new TextRun({
            text: '本报告由AI系统基于企业工商信息（企查查MCP）和财务报表内容（OCR解析）自动生成，仅供参考，不构成投资建议。',
            size: 24, color: '666666',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: '本报告中的信息和结论基于公开数据和AI模型分析，可能存在不准确或不完整的情况。投资决策应基于更全面的尽职调查和专业顾问意见。',
            size: 24, color: '666666',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
        new Paragraph({
          spacing: { before: 120 },
          children: [new TextRun({
            text: '使用本报告所产生的任何后果，本平台不承担任何责任。',
            size: 24, color: '666666',
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        }),
      ]
    }]
  })
  
  return await Packer.toBlob(doc)
}

/**
 * 解析Markdown为docx块
 */
function parseMarkdown(markdown) {
  if (!markdown) return []
  
  const lines = markdown.split('\n')
  const blocks = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i].trimEnd()
    
    // 空行
    if (!line.trim()) {
      i++
      continue
    }
    
    // 一级标题
    if (line.match(/^#\s+/)) {
      blocks.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({
          text: line.replace(/^#\s*/, ''),
          font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
        })]
      }))
      i++
      continue
    }
    
    // 二级标题
    if (line.match(/^##\s+/)) {
      blocks.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({
          text: line.replace(/^##\s*/, ''),
          font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
        })]
      }))
      i++
      continue
    }
    
    // 三级标题
    if (line.match(/^###\s+/)) {
      blocks.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({
          text: line.replace(/^###\s*/, ''),
          font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
        })]
      }))
      i++
      continue
    }
    
    // 表格检测（简单Markdown表格）
    if (line.match(/^\|.+\|$/)) {
      const tableLines = []
      while (i < lines.length && lines[i].match(/^\|.+\|$/)) {
        tableLines.push(lines[i])
        i++
      }
      
      if (tableLines.length >= 2) {
        const table = buildTable(tableLines)
        if (table) blocks.push(table)
        continue
      }
    }
    
    // 引用块
    if (line.match(/^>\s+/)) {
      const quoteLines = []
      while (i < lines.length && lines[i].match(/^>\s+/)) {
        quoteLines.push(lines[i].replace(/^>\s*/, ''))
        i++
      }
      blocks.push(new Paragraph({
        spacing: { before: 120, after: 120 },
        indent: { left: 720 },
        children: [new TextRun({
          text: quoteLines.join(' '),
          italics: true,
          color: '555555',
          size: 24,
          font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
        })]
      }))
      continue
    }
    
    // 列表项
    if (line.match(/^[-*]\s+/)) {
      const listItems = []
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        listItems.push(lines[i].replace(/^[-*]\s+/, ''))
        i++
      }
      
      for (const item of listItems) {
        blocks.push(new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 480 },
          children: parseInlineFormat('• ' + item)
        }))
      }
      continue
    }
    
    // 数字列表
    if (line.match(/^\d+\.\s+/)) {
      const listItems = []
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        listItems.push(lines[i])
        i++
      }
      
      listItems.forEach((item, idx) => {
        blocks.push(new Paragraph({
          spacing: { before: 60, after: 60 },
          indent: { left: 480 },
          children: parseInlineFormat(`${idx + 1}. ${item.replace(/^\d+\.\s+/, '')}`)
        }))
      })
      continue
    }
    
    // 分隔线
    if (line.match(/^---+$/)) {
      blocks.push(new Paragraph({
        spacing: { before: 240, after: 240 },
        children: [new TextRun({ text: '— — — — — — — — — — — — — — — —', color: 'CCCCCC' })]
      }))
      i++
      continue
    }
    
    // 普通段落（处理内联格式）
    blocks.push(new Paragraph({
      spacing: { before: 120, after: 60 },
      children: parseInlineFormat(line)
    }))
    i++
  }
  
  return blocks
}

/**
 * 解析内联格式（粗体、斜体、代码）
 */
function parseInlineFormat(text) {
  const runs = []
  
  // 简化处理：用TextRun数组表达
  // 处理 **bold** 内容
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  
  for (const part of parts) {
    if (!part) continue
    
    if (part.startsWith('**') && part.endsWith('**')) {
      // 粗体
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
        size: 24,
        font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
      }))
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      // 斜体
      runs.push(new TextRun({
        text: part.slice(1, -1),
        italics: true,
        size: 24,
        font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
      }))
    } else if (part.startsWith('`') && part.endsWith('`')) {
      // 代码
      runs.push(new TextRun({
        text: part.slice(1, -1),
        font: { ascii: 'Consolas', hAnsi: 'Consolas', eastAsia: 'Microsoft YaHei' },
        size: 22,
        shading: { fill: 'F5F5F5' }
      }))
    } else {
      // 普通文本
      runs.push(new TextRun({
        text: part,
        size: 24,
        font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
      }))
    }
  }
  
  return runs.length > 0 ? runs : [new TextRun({ text })]
}

/**
 * 构建表格
 */
function buildTable(tableLines) {
  if (tableLines.length < 2) return null
  
  // 第一行是表头，第二行是分隔符（--- | ---），之后是数据
  const headerCells = tableLines[0].split('|').slice(1, -1).map(c => c.trim())
  
  // 跳过分隔符行
  const dataRows = []
  for (let i = 2; i < tableLines.length; i++) {
    const cells = tableLines[i].split('|').slice(1, -1).map(c => c.trim())
    if (cells.length === headerCells.length) {
      dataRows.push(cells)
    }
  }
  
  if (headerCells.length === 0) return null
  
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const borders = { top: border, bottom: border, left: border, right: border }
  
  const cellWidth = Math.floor(9000 / headerCells.length)
  
  const rows = [
    // 表头
    new TableRow({
      cantSplit: true,
      tableHeader: true,
      children: headerCells.map(text => new TableCell({
        borders,
        width: { size: cellWidth, type: WidthType.DXA },
        shading: { fill: 'D5E8F0', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text,
            bold: true,
            size: 22,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        })]
      }))
    }),
    // 数据行
    ...dataRows.map(cells => new TableRow({
      cantSplit: true,
      children: cells.map(text => new TableCell({
        borders,
        width: { size: cellWidth, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text,
            size: 22,
            font: { ascii: 'Arial', hAnsi: 'Arial', eastAsia: 'Microsoft YaHei' }
          })]
        })]
      }))
    }))
  ]
  
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: headerCells.map(() => cellWidth),
    rows
  })
}