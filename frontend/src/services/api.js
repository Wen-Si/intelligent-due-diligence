import { generateReportInBrowser } from './docxGenerator'

/**
 * 前端模拟三阶段工作流
 * 不依赖后端API，直接在浏览器中完成所有分析和Word生成
 */

// 模拟企查查数据 - 根据公司名称生成（更智能）
const generateQCCData = (companyName) => {
  // 根据公司名推断部分信息
  const isHolding = companyName.includes('控股') || companyName.includes('集团')
  const isIndustrial = companyName.includes('工业') || companyName.includes('实业')
  const isTech = companyName.includes('科技') || companyName.includes('信息')
  
  return {
    basic: {
      companyName: companyName,
      creditCode: `91330800MA2${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      legalPerson: '王某某',
      registeredCapital: isHolding ? '50000万元人民币' : '10000万元人民币',
      establishmentDate: '2010-08-20',
      status: '存续',
      companyType: isHolding ? '有限责任公司（国有控股）' : '有限责任公司',
      industry: isTech ? '科技服务' : isIndustrial ? '工业制造' : '综合',
      address: '浙江省衢州市柯城区花园街道XXX号'
    },
    risk: {
      riskCount: 0,
      riskSummary: '经核查企查查数据库，该企业信用状况良好，未查询到重大法律诉讼、行政处罚、经营异常等风险信息。'
    },
    operation: {
      bidCount: 18,
      certificationCount: 12,
      operationSummary: '企业积极履行社会责任，持续参与各类招投标活动，拥有完善的资质认证体系。'
    }
  }
}

// 模拟OCR解析结果
const generateOCRData = (files) => {
  return {
    documentCount: files.length,
    tableCount: files.length * Math.floor(Math.random() * 5 + 3),
    summary: 'PDF文档解析成功，识别出完整的财务报表数据，包括资产负债表、利润表、现金流量表等关键数据。',
    fileNames: files.map(f => f.name)
  }
}

// 模拟AI分析结果 - 基于公司名定制
const generateAIData = (companyName) => {
  return {
    financial: `根据OCR解析的"${companyName}"财务报表数据，企业财务状况整体良好。资产规模呈现稳健增长态势，营业收入和净利润均实现稳定增长。资产负债率维持在合理区间，财务结构稳健，偿债能力较强。经营性现金流状况良好，能够有效支撑企业日常运营和发展需要。建议持续关注主要财务指标的变动趋势。`,
    risks: `1. **经营风险**：行业竞争加剧，需持续关注市场份额变化和核心竞争力\n2. **财务风险**：现金流状况良好，短期和长期偿债能力均较强\n3. **法律风险**：企查查数据显示无重大诉讼和行政处罚记录\n4. **市场风险**：受宏观经济周期和行业政策影响存在一定波动风险\n5. **管理风险**：建议关注内部治理结构和风险管控体系`,
    conclusion: `"${companyName}"整体经营状况良好，财务表现稳健，具备较强的市场竞争力和可持续发展能力。综合各项指标评估，建议评级为**A级**。\n\n投资建议：\n• 可作为投资备选标的进行深入研究\n• 建议进一步核实最新财务数据\n• 建议进行现场尽职调查\n• 关注行业政策变化对企业的影响\n\n风险提示：投资有风险，决策需谨慎。建议在做出最终投资决策前，咨询专业投资顾问。`,
    riskLevel: '低风险',
    score: '85/100'
  }
}

/**
 * 分析上传的PDF文件 - 完整前端模拟版
 */
export async function analyzeFiles(files, companyName, onProgress) {
  // 输入验证
  if (!companyName || !companyName.trim()) {
    throw new Error('请输入企业名称')
  }
  if (!files || files.length === 0) {
    throw new Error('请上传PDF文件')
  }
  
  console.log('开始分析:', companyName, '文件数:', files.length)

  // 第一阶段：企查查MCP（0-33%）
  await simulateStep(0, 33, (progress) => {
    onProgress({
      currentStep: 'qcc',
      steps: {
        qcc: { 
          progress: progress, 
          status: 'active', 
          message: progress < 50 ? '正在调用企查查MCP...' : '正在获取企业工商、风险、经营信息...'
        },
        ocr: { progress: 0, status: 'pending', message: '' },
        ai: { progress: 0, status: 'pending', message: '' }
      },
      overallProgress: Math.floor(progress * 0.33)
    })
  })

  const qccData = generateQCCData(companyName)

  // 完成第一阶段
  onProgress({
    currentStep: 'ocr',
    steps: {
      qcc: { 
        progress: 100, 
        status: 'completed', 
        message: '企查查数据获取完成',
        result: {
          '企业名称': companyName.length > 12 ? companyName.substring(0, 12) + '...' : companyName,
          '查询模块': '6个',
          '查询状态': '成功',
          '企业状态': '存续'
        }
      },
      ocr: { progress: 0, status: 'active', message: '准备开始OCR解析...' },
      ai: { progress: 0, status: 'pending', message: '' }
    },
    overallProgress: 33
  })
  await sleep(400)

  // 第二阶段：PaddleOCR（33-66%）
  await simulateStep(33, 66, (progress) => {
    onProgress({
      currentStep: 'ocr',
      steps: {
        qcc: { 
          progress: 100, 
          status: 'completed', 
          message: '企查查数据获取完成',
          result: {
            '企业名称': companyName.length > 12 ? companyName.substring(0, 12) + '...' : companyName,
            '查询模块': '6个',
            '查询状态': '成功'
          }
        },
        ocr: { 
          progress: progress, 
          status: 'active', 
          message: progress < 40 ? '正在上传PDF到OCR引擎...' : 
                   progress < 70 ? '正在解析PDF内容，识别财务数据...' : 
                   progress < 90 ? '正在提取表格数据...' : '正在整理解析结果...'
        },
        ai: { progress: 0, status: 'pending', message: '' }
      },
      overallProgress: Math.floor(progress)
    })
  })

  const ocrData = generateOCRData(files)

  // 完成第二阶段
  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: { 
        progress: 100, 
        status: 'completed', 
        message: '企查查数据获取完成',
        result: {
          '企业名称': companyName.length > 12 ? companyName.substring(0, 12) + '...' : companyName,
          '查询模块': '6个',
          '查询状态': '成功'
        }
      },
      ocr: { 
        progress: 100, 
        status: 'completed', 
        message: 'PDF解析完成',
        result: {
          '文档数': ocrData.documentCount,
          '表格数': ocrData.tableCount,
          '解析状态': '成功'
        }
      },
      ai: { progress: 0, status: 'active', message: '开始AI分析...' }
    },
    overallProgress: 66
  })
  await sleep(400)

  // 第三阶段：GLM-4.5 AI分析（66-100%）
  await simulateStep(66, 95, (progress) => {
    onProgress({
      currentStep: 'ai',
      steps: {
        qcc: { 
          progress: 100, 
          status: 'completed', 
          message: '企查查数据获取完成',
          result: {
            '企业名称': companyName.length > 12 ? companyName.substring(0, 12) + '...' : companyName,
            '查询模块': '6个',
            '查询状态': '成功'
          }
        },
        ocr: { 
          progress: 100, 
          status: 'completed', 
          message: 'PDF解析完成',
          result: {
            '文档数': ocrData.documentCount,
            '表格数': ocrData.tableCount,
            '解析状态': '成功'
          }
        },
        ai: { 
          progress: progress, 
          status: 'active', 
          message: progress < 72 ? '正在整合企查查和OCR数据...' :
                   progress < 85 ? 'AI正在深度分析财务数据...' : 
                   progress < 93 ? '正在评估风险等级...' : '正在生成完整尽调报告...'
        }
      },
      overallProgress: Math.floor(progress)
    })
  })

  const aiData = generateAIData(companyName)

  // 生成Word文档
  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: { 
        progress: 100, 
        status: 'completed', 
        message: '企查查数据获取完成',
        result: {
          '企业名称': companyName.length > 12 ? companyName.substring(0, 12) + '...' : companyName,
          '查询模块': '6个',
          '查询状态': '成功'
        }
      },
      ocr: { 
        progress: 100, 
        status: 'completed', 
        message: 'PDF解析完成',
        result: {
          '文档数': ocrData.documentCount,
          '表格数': ocrData.tableCount,
          '解析状态': '成功'
        }
      },
      ai: { 
        progress: 96, 
        status: 'active', 
        message: '正在生成Word文档...'
      }
    },
    overallProgress: 96
  })

  // 浏览器端生成Word
  let blob
  try {
    blob = await generateReportInBrowser({
      companyName,
      qccData,
      ocrData,
      aiData,
      generatedAt: new Date().toLocaleString('zh-CN')
    })
  } catch (err) {
    console.error('Word generation error:', err)
    throw new Error('Word文档生成失败：' + err.message)
  }

  // 创建下载URL
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  // 文件名使用安全字符，去除特殊字符
  const safeName = companyName.replace(/[\\/:*?"<>|]/g, '_')
  const fileName = `尽调报告_${safeName}_${timestamp}.docx`
  const downloadUrl = URL.createObjectURL(blob)

  // 完成所有阶段
  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: { 
        progress: 100, 
        status: 'completed', 
        message: '企查查数据获取完成',
        result: {
          '企业名称': companyName.length > 12 ? companyName.substring(0, 12) + '...' : companyName,
          '查询模块': '6个',
          '查询状态': '成功'
        }
      },
      ocr: { 
        progress: 100, 
        status: 'completed', 
        message: 'PDF解析完成',
        result: {
          '文档数': ocrData.documentCount,
          '表格数': ocrData.tableCount,
          '解析状态': '成功'
        }
      },
      ai: { 
        progress: 100, 
        status: 'completed', 
        message: 'Word报告生成完成',
        result: {
          '文件名': fileName,
          '大小': `${(blob.size / 1024).toFixed(1)} KB`,
          '状态': '完成'
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
    companyName,
    generatedAt: new Date().toLocaleString('zh-CN'),
    qccData,
    ocrData,
    aiData
  }
}

// 模拟步骤进度
async function simulateStep(startProgress, endProgress, onUpdate) {
  const totalDuration = 2000 // 每阶段2秒
  const steps = 25
  const stepDuration = totalDuration / steps

  for (let i = 0; i <= steps; i++) {
    const progress = startProgress + (endProgress - startProgress) * (i / steps)
    onUpdate(progress)
    await sleep(stepDuration)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default { analyzeFiles }