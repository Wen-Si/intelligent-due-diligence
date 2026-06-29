import { generateReportInBrowser } from './docxGenerator'

/**
 * 前端模拟三阶段工作流
 * 不依赖后端API，直接在浏览器中完成所有分析和Word生成
 */

// 模拟企查查数据
const generateQCCData = (companyName) => {
  return {
    basic: {
      companyName: companyName,
      creditCode: `91330100MA2${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      legalPerson: '张某某',
      registeredCapital: '5000万元人民币',
      establishmentDate: '2015-06-15',
      status: '存续',
      companyType: '有限责任公司（自然人投资或控股）',
      industry: '互联网/科技服务',
      address: '浙江省杭州市西湖区文一西路969号'
    },
    risk: {
      riskCount: Math.floor(Math.random() * 3),
      riskSummary: '经核查，企查查数据库中未查询到该企业的重大法律诉讼、行政处罚、经营异常等风险信息。'
    },
    operation: {
      bidCount: 12,
      certificationCount: 8,
      operationSummary: '企业积极参与招投标活动，拥有多项专业资质证书。'
    }
  }
}

// 模拟OCR解析结果
const generateOCRData = (files) => {
  return {
    documentCount: files.length,
    tableCount: files.length * Math.floor(Math.random() * 5 + 3),
    summary: '财务报表数据完整，包含资产负债表、利润表、现金流量表等关键数据。'
  }
}

// 模拟AI分析结果
const generateAIData = (companyName) => {
  return {
    financial: '根据OCR解析的财务报表数据，企业近三年营收呈现稳步增长态势，年均增长率约为15-20%。净利润率保持在20%以上，显示出良好的盈利能力。资产负债率维持在40-50%的健康区间，财务结构稳健。',
    risks: '1. 经营风险：行业竞争激烈，需关注市场份额变化\n2. 财务风险：现金流状况良好，短期偿债能力较强\n3. 法律风险：未发现重大诉讼和行政处罚记录\n4. 市场风险：受宏观经济影响存在一定波动风险',
    conclusion: '该企业整体经营状况良好，财务表现稳健，具备较强的市场竞争力和发展潜力。建议在投资前进一步核实最新财务数据，进行现场尽职调查，并关注行业政策变化对企业的影响。',
    riskLevel: '低风险',
    score: '85/100'
  }
}

/**
 * 分析上传的PDF文件 - 完整前端模拟版
 */
export async function analyzeFiles(files, companyName, onProgress) {
  console.log('开始分析:', companyName, '文件数:', files.length)

  // 第一阶段：企查查MCP（0-33%）
  await simulateStep('qcc', 0, 33, (progress) => {
    onProgress({
      currentStep: 'qcc',
      steps: {
        qcc: { 
          progress: progress, 
          status: 'active', 
          message: progress < 50 ? '正在调用企查查MCP...' : '正在获取企业工商信息...'
        },
        ocr: { progress: 0, status: 'pending' },
        ai: { progress: 0, status: 'pending' }
      },
      overallProgress: Math.floor(progress * 0.33)
    })
  })

  const qccData = generateQCCData(companyName)

  await completeStep('qcc', 33, onProgress, {
    '企业名称': companyName,
    '查询模块': '6个',
    '查询状态': '成功'
  })

  // 第二阶段：PaddleOCR（33-66%）
  await simulateStep('ocr', 33, 66, (progress) => {
    onProgress({
      currentStep: 'ocr',
      steps: {
        qcc: { progress: 100, status: 'completed', result: { '状态': '成功' } },
        ocr: { 
          progress: progress, 
          status: 'active', 
          message: progress < 40 ? '正在上传PDF到OCR引擎...' : 
                   progress < 80 ? '正在解析PDF内容...' : '正在提取表格数据...'
        },
        ai: { progress: 0, status: 'pending' }
      },
      overallProgress: 33 + Math.floor((progress - 33) * 1)
    })
  })

  const ocrData = generateOCRData(files)

  await completeStep('ocr', 66, onProgress, {
    '文档数': files.length,
    '表格数': ocrData.tableCount,
    '解析状态': '完成'
  })

  // 第三阶段：GLM-4.5 AI分析（66-100%）
  await simulateStep('ai', 66, 100, (progress) => {
    onProgress({
      currentStep: 'ai',
      steps: {
        qcc: { progress: 100, status: 'completed', result: { '状态': '成功' } },
        ocr: { progress: 100, status: 'completed', result: { '文档数': files.length } },
        ai: { 
          progress: progress, 
          status: 'active', 
          message: progress < 70 ? '正在整合数据...' :
                   progress < 90 ? 'AI正在分析财务数据...' : '正在生成Word报告...'
        }
      },
      overallProgress: progress
    })
  })

  const aiData = generateAIData(companyName)

  // 生成Word文档
  onProgress({
    currentStep: 'ai',
    steps: {
      qcc: { progress: 100, status: 'completed', result: { '企业名称': companyName } },
      ocr: { progress: 100, status: 'completed', result: { '文档数': files.length, '表格数': ocrData.tableCount } },
      ai: { 
        progress: 95, 
        status: 'active', 
        message: '正在生成Word文档...'
      }
    },
    overallProgress: 95
  })

  // 浏览器端生成Word
  const blob = await generateReportInBrowser({
    companyName,
    qccData,
    ocrData,
    aiData,
    generatedAt: new Date().toLocaleString('zh-CN')
  })

  // 创建下载URL
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileName = `尽调报告_${companyName}_${timestamp}.docx`
  const downloadUrl = URL.createObjectURL(blob)

  await completeStep('ai', 100, onProgress, {
    '文件名': fileName,
    '大小': `${(blob.size / 1024).toFixed(1)} KB`
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
async function simulateStep(stepName, startProgress, endProgress, onUpdate) {
  const duration = 2000 // 每阶段2秒
  const steps = 20
  const stepDuration = duration / steps

  for (let i = 0; i <= steps; i++) {
    const progress = startProgress + (endProgress - startProgress) * (i / steps)
    onUpdate(progress)
    await sleep(stepDuration)
  }
}

// 完成步骤
async function completeStep(stepName, progress, onProgress, result) {
  const steps = ['qcc', 'ocr', 'ai']
  const stepIndex = steps.indexOf(stepName)
  const completedSteps = {}
  
  steps.forEach((s, i) => {
    if (i < stepIndex) {
      completedSteps[s] = { progress: 100, status: 'completed', result: { '状态': '成功' } }
    } else if (i === stepIndex) {
      completedSteps[s] = { progress: 100, status: 'completed', result }
    } else {
      completedSteps[s] = { progress: 0, status: 'pending' }
    }
  })

  onProgress({
    currentStep: stepName,
    steps: completedSteps,
    overallProgress: progress
  })
  
  await sleep(300)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default { analyzeFiles }