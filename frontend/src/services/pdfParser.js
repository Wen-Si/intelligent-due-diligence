/**
 * 浏览器端PDF解析服务
 * 双模式解析：
 * 1. pdf.js 文本提取（适用于数字PDF）
 * 2. GLM-4V 视觉OCR（适用于扫描件/图片PDF）
 */

import { OCRWithGLM4V } from './glmService'

/**
 * 解析PDF文件 - 自动选择最佳方式
 * @param {File} file - PDF文件
 * @param {Function} onPageProgress - 页面进度回调 (pageNum, totalPages, method)
 * @returns {Promise<Object>} {fullText, pageCount, tables, method}
 */
export async function extractTextFromPDF(file, onPageProgress) {
  console.log(`======= 开始解析PDF: ${file.name} =======`)

  // 第一步：尝试pdf.js文本提取
  let pdfResult = null
  try {
    pdfResult = await extractTextWithPdfJs(file)
    console.log(`pdf.js提取完成: ${pdfResult.fullText.length} 字符, ${pdfResult.pageCount} 页`)
  } catch (err) {
    console.warn('pdf.js提取失败:', err.message)
  }

  // 判断是否需要视觉OCR
  // 如果pdf.js返回的文本太少（平均每页少于200字符），说明可能是扫描件
  const avgCharsPerPage = pdfResult ? pdfResult.fullText.length / pdfResult.pageCount : 0
  const needVisionOCR = !pdfResult || avgCharsPerPage < 200

  console.log(`平均每页字符数: ${avgCharsPerPage}, 需要视觉OCR: ${needVisionOCR}`)

  if (!needVisionOCR) {
    // pdf.js提取的文本足够，直接使用
    console.log('使用pdf.js文本提取结果（数字PDF）')
    return {
      ...pdfResult,
      method: 'pdfjs',
      fileName: file.name,
      fileSize: file.size
    }
  }

  // 第二步：使用GLM-4V视觉OCR
  console.log('文本不足，启动GLM-4V视觉OCR...')
  try {
    const visionResult = await extractTextWithVision(file, pdfResult?.pageCount || 0, onPageProgress)
    
    // 如果pdf.js有一些文本，合并结果
    let combinedText = visionResult.fullText
    if (pdfResult && pdfResult.fullText.length > 50) {
      combinedText = `[pdf.js提取的文本]\n${pdfResult.fullText}\n\n[GLM-4V视觉OCR提取的文本]\n${visionResult.fullText}`
    }

    console.log(`视觉OCR完成: ${visionResult.fullText.length} 字符`)
    console.log(`======= PDF解析结束: ${file.name} =======`)

    return {
      fullText: combinedText,
      pageCount: visionResult.pageCount,
      tables: visionResult.tables || [],
      method: 'glm-4v-vision',
      fileName: file.name,
      fileSize: file.size,
      pdfjsTextLength: pdfResult?.fullText?.length || 0,
      visionTextLength: visionResult.fullText.length
    }
  } catch (visionErr) {
    console.error('GLM-4V视觉OCR也失败:', visionErr.message)
    
    // 如果视觉OCR失败但pdf.js有结果，使用pdf.js结果
    if (pdfResult && pdfResult.fullText.length > 0) {
      return {
        ...pdfResult,
        method: 'pdfjs-fallback',
        fileName: file.name,
        fileSize: file.size,
        warning: '视觉OCR失败，使用pdf.js有限文本'
      }
    }
    
    throw new Error(`PDF解析失败: pdf.js和GLM-4V均无法提取文本 - ${visionErr.message}`)
  }
}

/**
 * 使用pdf.js提取文本
 */
async function extractTextWithPdfJs(file) {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  console.log(`pdf.js加载成功, 总页数: ${pdf.numPages}`)

  const textParts = []
  const tableData = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = groupTextItems(textContent.items)
    textParts.push(`\n=== 第${pageNum}页 ===\n${pageText}`)

    const tables = detectTables(textContent.items)
    if (tables.length > 0) {
      tableData.push({ page: pageNum, tables })
    }
  }

  return {
    fullText: textParts.join('\n'),
    pageCount: pdf.numPages,
    tables: tableData
  }
}

/**
 * 使用GLM-4V视觉模型OCR提取PDF文本
 * 将每页渲染为图片，发送给GLM-4V识别
 */
async function extractTextWithVision(file, knownPageCount, onPageProgress) {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageCount = knownPageCount || pdf.numPages

  console.log(`GLM-4V视觉OCR: 开始处理 ${pageCount} 页`)

  const pageTexts = []

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (onPageProgress) {
      onPageProgress(pageNum, pageCount, 'vision')
    }

    console.log(`GLM-4V: 正在处理第 ${pageNum}/${pageCount} 页...`)

    try {
      // 渲染PDF页面为canvas图片
      const page = await pdf.getPage(pageNum)
      const imageData = await renderPageToImage(page, pageNum)

      // 发送给GLM-4V进行OCR
      const pageText = await OCRWithGLM4V(imageData.base64, pageNum, imageData.width, imageData.height)
      pageTexts.push(`\n=== 第${pageNum}页 ===\n${pageText}`)

      console.log(`GLM-4V: 第${pageNum}页OCR完成, 提取 ${pageText.length} 字符`)
    } catch (err) {
      console.error(`GLM-4V: 第${pageNum}页OCR失败:`, err.message)
      pageTexts.push(`\n=== 第${pageNum}页 ===\n[OCR失败: ${err.message}]`)
    }
  }

  return {
    fullText: pageTexts.join('\n'),
    pageCount: pageCount,
    tables: []
  }
}

/**
 * 将PDF页面渲染为高分辨率图片
 */
async function renderPageToImage(page, pageNum) {
  // 使用较高的缩放比例以保证文字清晰
  const scale = 2.0
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise

  // 转换为JPEG以减小体积（base64编码）
  const base64 = canvas.toDataURL('image/jpeg', 0.85)
  
  console.log(`页面${pageNum}图片: ${canvas.width}x${canvas.height}, base64长度: ${base64.length}`)

  return {
    base64,
    width: canvas.width,
    height: canvas.height
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
        // 有些版本挂载在不同位置
        if (window['pdfjs-dist/build/pdf']) {
          window.pdfjsLib = window['pdfjs-dist/build/pdf']
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
          resolve(window.pdfjsLib)
        } else {
          reject(new Error('pdf.js加载成功但未找到pdfjsLib对象'))
        }
      }
    }
    script.onerror = () => reject(new Error('pdf.js脚本加载失败，可能是CDN不可用'))
    document.head.appendChild(script)
  })
}

/**
 * 按位置分组文本项，重组为段落
 */
function groupTextItems(items) {
  if (!items || items.length === 0) return ''

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

  const sortedYs = Object.keys(lines).map(Number).sort((a, b) => b - a)

  const paragraphs = []
  let currentY = null

  sortedYs.forEach(y => {
    const sortedItems = lines[y].sort((a, b) => a.x - b.x)
    const lineText = sortedItems.map(item => item.text).join('')

    if (currentY !== null && Math.abs(currentY - y) > 15) {
      paragraphs.push('\n')
    }
    paragraphs.push(lineText)
    currentY = y
  })

  return paragraphs.join('\n').trim()
}

/**
 * 简单表格检测
 */
function detectTables(items) {
  if (!items || items.length < 4) return []

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
 * 简化的PDF文本提取（降级方案）
 */
export async function extractTextSimple(file) {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const decoder = new TextDecoder('utf-8', { fatal: false })
  const content = decoder.decode(bytes)

  const textMatches = content.match(/\(([^)]+)\)/g) || []
  const extracted = textMatches
    .map(m => m.slice(1, -1))
    .filter(t => t.length > 0 && /[\u4e00-\u9fa5a-zA-Z0-9]/.test(t))
    .join(' ')

  return {
    fullText: extracted || '无法解析PDF内容',
    pageCount: 1,
    tables: [],
    fileName: file.name,
    fileSize: file.size
  }
}
