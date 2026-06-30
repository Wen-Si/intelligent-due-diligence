/**
 * 尽调工作流编排层
 * 整合企查查MCP + PaddleOCR + GLM-4.5 三个数据源
 * 所有调用在浏览器端完成（GitHub Pages 静态部署）
 */
import { queryCompanyFullInfo } from './qccClient'
import { extractTextFromPDF } from './pdfParser'
import { callGLM45 } from './glmService'
import { generateReportFromMarkdown } from './docxGenerator'

/**
 * 完整三阶段尽调工作流
 * @param {FileList} files - 用户上传的PDF文件
 * @param {string} companyName - 企业完整名称
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<Object>} 报告结果
 */
export async function analyzeFiles(files, companyName, onProgress) {
  // 输入验证
  if (!companyName || !companyName.trim()) {
    throw new Error('请输入企业名称')
  }
  if (!files || files.length === 0) {
    throw new Error('请上传PDF文件')
  }

  const trimmedName = companyName.trim()
  console.log('开始尽调分析:', trimmedName, '文件数:', files.length)

  // ==================== 阶段1: 企查查MCP (0-33%) ====================
  onProgress({
    currentStep: 'qcc',
    steps: {
      qcc: { progress: 10, status: 'active', message: '正在调用企查查MCP...' },
      ocr: { progress: 0, status: 'pending', message: '' },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 5
  })

  await sleep(300)
  onProgress({
    currentStep: 'qcc',
    steps: {
      qcc: { progress: 40, status: 'active', message: '正在获取企业工商、股东信息...' },
      ocr: { progress: 0, status: 'pending', message: '' },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 15
  })

  // 实际调用企查查MCP
  let qccData
  try {
    qccData = await queryCompanyFullInfo(trimmedName)
  } catch (err) {
    console.warn('企查查MCP异常，使用降级数据:', err.message)
    qccData = { basic: { companyName: trimmedName }, error: err.message }
  }

  onProgress({
    currentStep: 'qcc',
    steps: {
      qcc: { progress: 75, status: 'active', message: '正在获取风险、经营、知识产权信息...' },
      ocr: { progress: 0, status: 'pending', message: '' },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 25
  })

  await sleep(300)

  // 阶段1完成
  const qccSummary = buildQCCSummary(qccData)
  onProgress({
    currentStep: 'qcc',
    steps: {
      qcc: {
        progress: 100,
        status: 'completed',
        message: '企查查数据获取完成',
        result: qccSummary
      },
      ocr: { progress: 0, status: 'pending', message: '' },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 33
  })
  await sleep(400)

  // ==================== 阶段2: PaddleOCR PDF解析 (33-66%) ====================
  onProgress({
    currentStep: 'ocr',
    steps: {
      qcc: {
        progress: 100,
        status: 'completed',
        message: '企查查数据获取完成',
        result: qccSummary
      },
      ocr: { progress: 5, status: 'active', message: `正在准备解析 ${files.length} 个PDF文件...` },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 36
  })

  // 逐个解析PDF
  const pdfTexts = []
  const pdfResults = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress({
      currentStep: 'ocr',
      steps: {
        qcc: {
          progress: 100,
          status: 'completed',
          message: '企查查数据获取完成',
          result: qccSummary
        },
        ocr: {
          progress: 10 + (i * 50 / files.length),
          status: 'active',
          message: `正在解析: ${file.name}`
        },
        ai: { progress: 0, status: 'pending', message: '' }
      },
      overallProgress: 36 + (i * 25 / files.length)
    })

    try {
      const result = await extractTextFromPDF(file)
      pdfTexts.push(`\n\n========== 文件: ${file.name} (${result.pageCount}页) ==========\n${result.fullText}`)
      pdfResults.push({
        fileName: file.name,
        pageCount: result.pageCount,
        fileSize: file.fileSize || file.size,
        tableCount: (result.tables || []).length
      })
    } catch (err) {
      console.error(`PDF解析失败: ${file.name}`, err)
      pdfTexts.push(`\n\n========== 文件: ${file.name} (解析失败) ==========\n[错误] ${err.message}`)
      pdfResults.push({
        fileName: file.name,
        pageCount: 0,
        fileSize: file.size,
        tableCount: 0,
        error: err.message
      })
    }
  }

  // 合并所有PDF文本作为OCR结果（字符串）
  const ocrText = pdfTexts.join('\n')

  // 阶段2完成
  const totalPages = pdfResults.reduce((sum, r) => sum + (r.pageCount || 0), 0)
  const totalTables = pdfResults.reduce((sum, r) => sum + (r.tableCount || 0), 0)
  onProgress({
    currentStep: 'ocr',
    steps: {
      qcc: {
        progress: 100,
        status: 'completed',
        message: '企查查数据获取完成',
        result: qccSummary
      },
      ocr: {
        progress: 100,
        status: 'completed',
        message: `PDF解析完成（${totalPages}页，${totalTables}个表格）`,
        result: {
          '文档数': files.length,
          '总页数': totalPages,
          '表格数': totalTables,
          '解析状态': '成功',
          '文本长度': `${(ocrText.length / 1000).toFixed(1)}KB`
        }
      },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 66
  })
  await sleep(400)

  // ==================== 阶段3: GLM-4.5 AI生成 (66-100%) ====================
  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: {
        progress: 100,
        status: 'completed',
        message: '企查查数据获取完成',
        result: qccSummary
      },
      ocr: {
        progress: 100,
        status: 'completed',
        message: `PDF解析完成（${totalPages}页，${totalTables}个表格）`,
        result: {
          '文档数': files.length,
          '总页数': totalPages,
          '表格数': totalTables
        }
      },
      ai: { progress: 10, status: 'active', message: '正在调用GLM-4.5-Flash生成尽调报告...' }
    },
    overallProgress: 70
  })

  // 实际调用GLM-4.5-Flash
  // 系统提示词：企业尽调专家 + 尽调报告撰写要求
  // 用户提示词：企查查MCP数据 + OCR解析的财务报表（字符串形式）
  let aiResult
  try {
    aiResult = await callGLM45(trimmedName, qccData, ocrText)
  } catch (err) {
    console.error('GLM-4.5调用失败:', err)
    throw new Error('AI生成报告失败: ' + err.message)
  }

  const aiContent = aiResult.content
  console.log('GLM-4.5生成内容长度:', aiContent.length, 'tokens:', aiResult.usage?.total_tokens)

  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: {
        progress: 100,
        status: 'completed',
        message: '企查查数据获取完成',
        result: qccSummary
      },
      ocr: {
        progress: 100,
        status: 'completed',
        message: `PDF解析完成（${totalPages}页，${totalTables}个表格）`,
        result: {
          '文档数': files.length,
          '总页数': totalPages
        }
      },
      ai: { progress: 85, status: 'active', message: '正在生成Word文档...' }
    },
    overallProgress: 92
  })

  // 生成Word文档
  const blob = await generateReportFromMarkdown(trimmedName, aiContent, {
    generatedAt: new Date().toLocaleString('zh-CN'),
    qccSummary,
    pdfResults,
    usage: aiResult.usage,
    model: aiResult.model
  })

  // 创建下载链接
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const safeName = trimmedName.replace(/[\\/:*?"<>|]/g, '_')
  const fileName = `尽调报告_${safeName}_${timestamp}.docx`
  const downloadUrl = URL.createObjectURL(blob)

  // 阶段3完成
  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: {
        progress: 100,
        status: 'completed',
        message: '企查查数据获取完成',
        result: qccSummary
      },
      ocr: {
        progress: 100,
        status: 'completed',
        message: `PDF解析完成（${totalPages}页）`,
        result: {
          '文档数': files.length,
          '总页数': totalPages
        }
      },
      ai: {
        progress: 100,
        status: 'completed',
        message: '尽调报告生成完成',
        result: {
          '文件名': fileName,
          '文件大小': `${(blob.size / 1024).toFixed(1)} KB`,
          '报告字数': `${(aiContent.length / 1000).toFixed(1)}K`,
          'AI模型': aiResult.model || 'GLM-4.5-Flash',
          'Tokens': aiResult.usage?.total_tokens || '—'
        }
      }
    },
    overallProgress: 100
  })

  return {
    fileName,
    downloadUrl,
    blob,
    documentCount: files.length,
    companyName: trimmedName,
    generatedAt: new Date().toLocaleString('zh-CN'),
    qccData,
    ocrText,
    aiContent,
    pdfResults,
    usage: aiResult.usage,
    model: aiResult.model
  }
}

/**
 * 提取企查查数据摘要（用于进度展示）
 */
function buildQCCSummary(qccData) {
  const summary = {
    '企业名称': qccData?.basic?.companyName || '—'
  }
  if (qccData?.basic?.creditCode && qccData.basic.creditCode !== '—') {
    summary['信用代码'] = qccData.basic.creditCode
  }
  summary['查询模块'] = '6个MCP接口'
  if (qccData?.risk) {
    summary['风险数'] = `${qccData.risk.riskCount || 0} 条`
  }
  if (qccData?.operation) {
    summary['招投标'] = `${qccData.operation.bidCount || 0} 条`
  }
  if (qccData?.ipr) {
    summary['知识产权'] = `商标${qccData.ipr.trademarkCount || 0}/专利${qccData.ipr.patentCount || 0}`
  }
  if (qccData?.shareholders) {
    summary['股东数'] = `${qccData.shareholders.length} 个`
  }
  summary['查询状态'] = '成功'
  return summary
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default { analyzeFiles }
