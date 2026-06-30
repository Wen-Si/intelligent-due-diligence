/**
 * 浏览器端PDF解析服务
 * 使用pdf.js提取PDF文本内容
 */

/**
 * 使用pdf.js解析PDF文件
 * 由于pdf.js库较大，采用动态加载
 */
export async function extractTextFromPDF(file) {
  try {
    // 动态加载pdf.js
    const pdfjsLib = await loadPdfJs()
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    console.log(`PDF总页数: ${pdf.numPages}`)
    
    const textParts = []
    const tableData = []
    
    // 逐页提取文本
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // 重组文本，按位置排序
      const items = textContent.items
      const pageText = groupTextItems(items)
      textParts.push(`\n=== 第${pageNum}页 ===\n${pageText}`)
      
      // 尝试识别表格（简单按位置对齐）
      const tables = detectTables(items)
      if (tables.length > 0) {
        tableData.push({ page: pageNum, tables })
      }
    }
    
    return {
      fullText: textParts.join('\n'),
      pageCount: pdf.numPages,
      tables: tableData,
      fileName: file.name,
      fileSize: file.size
    }
  } catch (error) {
    console.error('PDF解析错误:', error)
    throw new Error('PDF解析失败: ' + error.message)
  }
}

/**
 * 动态加载pdf.js库
 */
async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js'
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
        resolve(window.pdfjsLib)
      } else {
        reject(new Error('pdf.js加载失败'))
      }
    }
    script.onerror = () => reject(new Error('pdf.js脚本加载失败'))
    document.head.appendChild(script)
  })
}

/**
 * 按位置分组文本项，重组为段落
 */
function groupTextItems(items) {
  if (!items || items.length === 0) return ''
  
  // 按Y坐标分组（同一行）
  const lines = {}
  items.forEach(item => {
    if (!item.str || !item.transform) return
    const y = Math.round(item.transform[5])
    if (!lines[y]) lines[y] = []
    lines[y].push({
      x: item.transform[4],
      text: item.str
    })
  })
  
  // 按Y坐标从大到小排序（PDF坐标系Y向上）
  const sortedYs = Object.keys(lines).map(Number).sort((a, b) => b - a)
  
  const paragraphs = []
  let currentY = null
  
  sortedYs.forEach(y => {
    // 按X坐标排序（从左到右）
    const sortedItems = lines[y].sort((a, b) => a.x - b.x)
    const lineText = sortedItems.map(item => item.text).join(' ')
    
    // 段落分隔：Y坐标差异较大时换段
    if (currentY !== null && Math.abs(currentY - y) > 15) {
      paragraphs.push('\n')
    }
    paragraphs.push(lineText)
    currentY = y
  })
  
  return paragraphs.join('\n').trim()
}

/**
 * 简单表格检测（基于X坐标对齐）
 */
function detectTables(items) {
  if (!items || items.length < 4) return []
  
  // 按Y坐标分组
  const lines = {}
  items.forEach(item => {
    if (!item.str || !item.transform) return
    const y = Math.round(item.transform[5])
    if (!lines[y]) lines[y] = []
    lines[y].push({
      x: item.transform[4],
      text: item.str.trim()
    })
  })
  
  // 查找行项目数>=3的行（可能是表格）
  const tableRows = []
  Object.values(lines).forEach(line => {
    if (line.length >= 3 && line.every(item => item.text.length > 0)) {
      const sortedLine = line.sort((a, b) => a.x - b.x)
      tableRows.push(sortedLine.map(item => item.text))
    }
  })
  
  return tableRows
}

/**
 * 简化的PDF文本提取（不使用pdf.js，作为降级方案）
 * 适用于小文件或简单文档
 */
export async function extractTextSimple(file) {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  
  // 简单提取PDF中的文本（基于括号包围的字符串）
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const content = decoder.decode(bytes)
  
  // 尝试提取所有 (...) 中的文本
  const textMatches = content.match(/\(([^)]+)\)/g) || []
  const extracted = textMatches
    .map(m => m.slice(1, -1))
    .filter(t => t.length > 0 && /[\u4e00-\u9fa5a-zA-Z0-9]/.test(t))
    .join(' ')
  
  return {
    fullText: extracted || '无法解析PDF内容，请使用OCR接口',
    pageCount: 1,
    tables: [],
    fileName: file.name,
    fileSize: file.size
  }
}