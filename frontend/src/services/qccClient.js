/**
 * 企查查MCP服务（浏览器端直接调用）
 * 由于GitHub Pages无后端，直接从浏览器调用企查查MCP的SSE接口
 */

const QCC_API_KEY = 'M0XqvRM8Bp3CYNqfhcCIffODYeiaTc1h8ePLXyLS8tj9xQ51'

const QCC_ENDPOINTS = {
  company: 'https://agent.qcc.com/mcp/company/stream',
  risk: 'https://agent.qcc.com/mcp/risk/stream',
  ipr: 'https://agent.qcc.com/mcp/ipr/stream',
  operation: 'https://agent.qcc.com/mcp/operation/stream',
  executive: 'https://agent.qcc.com/mcp/executive/stream',
  history: 'https://agent.qcc.com/mcp/history/stream'
}

/**
 * 调用单个企查查MCP工具
 * 企查查MCP的tools使用 searchKey 作为企业名称参数
 */
async function callQCCTool(endpoint, toolName, searchKey, extraParams = {}) {
  const url = QCC_ENDPOINTS[endpoint]
  if (!url) throw new Error(`Unknown QCC endpoint: ${endpoint}`)
  
  const requestBody = {
    jsonrpc: '2.0',
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: { searchKey, ...extraParams }
    }
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QCC_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      console.warn(`QCC ${endpoint}/${toolName} HTTP ${response.status}`)
      return null
    }
    
    const text = await response.text()
    return parseSSEResponse(text)
  } catch (error) {
    console.warn(`QCC ${endpoint}/${toolName} error:`, error.message)
    return null
  }
}

/**
 * 解析SSE响应
 */
function parseSSEResponse(text) {
  const lines = text.split('\n')
  const events = []
  let currentEvent = null
  
  for (const line of lines) {
    if (line.startsWith('event: ')) {
      currentEvent = line.slice(7).trim()
    } else if (line.startsWith('data: ')) {
      const data = line.slice(6).trim()
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        events.push({ event: currentEvent, data: parsed })
      } catch (e) {
        // 忽略非JSON数据
      }
    }
  }
  
  // 优先返回有 result 的事件
  for (const evt of events) {
    if (evt.data?.result) return evt.data.result
  }
  
  // 兼容处理：返回 content 数组
  for (const evt of events) {
    if (evt.data?.content) return evt.data.content
  }
  
  return events.length > 0 ? events : null
}

/**
 * 查询企业综合信息 - 调用6个MCP模块
 * 根据企查查实际提供的工具名调用
 */
export async function queryCompanyFullInfo(companyName) {
  console.log('开始查询企查查企业信息:', companyName)
  
  // 并行调用6个MCP模块对应的核心工具
  // 每个模块选最相关的1-2个工具
  const tasks = [
    // 1. company模块 - 工商信息、股东信息
    callQCCTool('company', 'get_company_registration_info', companyName)
      .then(r => ({ type: 'basic', data: r })),
    callQCCTool('company', 'get_shareholder_info', companyName)
      .then(r => ({ type: 'shareholders', data: r })),
    callQCCTool('company', 'get_company_profile', companyName)
      .then(r => ({ type: 'profile', data: r })),
    
    // 2. risk模块 - 风险信息
    callQCCTool('risk', 'get_serious_violation', companyName)
      .then(r => ({ type: 'serious_violation', data: r })),
    callQCCTool('risk', 'get_judicial_documents', companyName)
      .then(r => ({ type: 'judicial', data: r })),
    
    // 3. ipr模块 - 知识产权
    callQCCTool('ipr', 'get_patents', companyName).catch(() => null)
      .then(r => ({ type: 'patents', data: r })),
    callQCCTool('ipr', 'get_trademarks', companyName).catch(() => null)
      .then(r => ({ type: 'trademarks', data: r })),
    
    // 4. operation模块 - 经营信息
    callQCCTool('operation', 'get_bidding_info', companyName).catch(() => null)
      .then(r => ({ type: 'bidding', data: r })),
    callQCCTool('operation', 'get_qualification_info', companyName).catch(() => null)
      .then(r => ({ type: 'qualification', data: r })),
    
    // 5. executive模块 - 高管信息
    callQCCTool('executive', 'get_key_personnel', companyName)
      .then(r => ({ type: 'executives', data: r })),
    
    // 6. history模块 - 变更记录
    callQCCTool('history', 'get_change_records', companyName)
      .then(r => ({ type: 'history', data: r }))
  ]
  
  const results = await Promise.allSettled(tasks)
  
  // 整合数据
  return integrateQCCData(companyName, results)
}

/**
 * 整合企查查数据为统一格式
 */
function integrateQCCData(companyName, results) {
  const dataMap = {}
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) {
      dataMap[r.value.type] = r.value.data
    }
  }
  
  return {
    companyName,
    basic: parseBasicInfo(dataMap.basic, dataMap.profile, companyName),
    shareholders: parseShareholders(dataMap.shareholders),
    executives: parseExecutives(dataMap.executives),
    risk: parseRiskInfo(dataMap.serious_violation, dataMap.judicial),
    operation: parseOperationInfo(dataMap.bidding, dataMap.qualification),
    ipr: parseIPRInfo(dataMap.patents, dataMap.trademarks),
    history: parseHistoryInfo(dataMap.history),
    raw: dataMap
  }
}

/**
 * 解析工商基本信息
 */
function parseBasicInfo(basicResult, profileResult, fallbackName) {
  let info = {
    companyName: fallbackName,
    creditCode: '—',
    legalPerson: '—',
    registeredCapital: '—',
    establishmentDate: '—',
    companyType: '—',
    status: '存续',
    industry: '—',
    address: '—',
    businessScope: '—'
  }
  
  // 从MCP响应中提取数据
  const extract = (result) => {
    if (!result) return null
    // result 可能是 {content: [{type: 'text', text: '...'}]} 格式
    if (Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === 'text' && item.text) {
          try {
            return typeof item.text === 'string' ? JSON.parse(item.text) : item.text
          } catch {
            return item.text
          }
        }
      }
    }
    // 也可能是直接的JSON对象
    if (typeof result === 'object' && result !== null) {
      return result
    }
    return null
  }
  
  const basicData = extract(basicResult)
  if (basicData && typeof basicData === 'object') {
    // 企查查MCP返回中文字段名
    info.companyName = basicData.企业名称 || basicData.companyName || basicData.name || basicData.entName || fallbackName
    info.creditCode = basicData.统一社会信用代码 || basicData.creditCode || basicData.unifiedCode || basicData.uscc || '—'
    info.legalPerson = basicData.法定代表人 || basicData.legalPerson || basicData.legalRepresentative || basicData.operName || '—'
    info.registeredCapital = basicData.注册资本 || basicData.registeredCapital || basicData.regCapital || basicData.registCapi || '—'
    info.establishmentDate = basicData.成立日期 || basicData.establishmentDate || basicData.esDate || basicData.startDate || '—'
    info.companyType = basicData.企业类型 || basicData.companyType || basicData.econKind || '—'
    info.status = basicData.登记状态 || basicData.status || basicData.openStatus || '存续'
    info.address = basicData.注册地址 || basicData.address || basicData.regAddress || basicData.dom || '—'
    info.businessScope = basicData.经营范围 || basicData.businessScope || basicData.scope || '—'
  }
  
  // 补充 profile 数据
  const profileData = extract(profileResult)
  if (profileData && typeof profileData === 'object') {
    if (info.industry === '—' && (profileData.industry || profileData.industryCode)) {
      info.industry = profileData.industry || profileData.industryCode
    }
  }
  
  return info
}

/**
 * 解析股东信息
 */
function parseShareholders(result) {
  if (!result) return []
  const data = extractContentData(result)
  if (!data) return []
  
  // 尝试多种字段名
  const shareholders = Array.isArray(data) ? data :
                       data.shareholders || data.holders || data.stockholders || []
  
  if (!Array.isArray(shareholders)) return []
  
  return shareholders.map(s => ({
    name: s.股东名称 || s.name || s.shareholderName || s.stockName || '—',
    percentage: s.持股比例 || s.出资比例 || s.percentage || s.shareholdingRatio || s.ratio || '—',
    amount: s.认缴出资额 || s.出资额 || s.amount || s.contribution || s.subConAmt || '—'
  }))
}

/**
 * 解析高管信息
 */
function parseExecutives(result) {
  if (!result) return []
  const data = extractContentData(result)
  if (!data) return []
  
  const executives = Array.isArray(data) ? data :
                     data.executives || data.personnel || data.keyPersonnel || []
  
  if (!Array.isArray(executives)) return []
  
  return executives.slice(0, 10).map(e => ({
    name: e.姓名 || e.name || e.personName || '—',
    position: e.职务 || e.position || e.title || e.duty || '—'
  }))
}

/**
 * 解析风险信息
 */
function parseRiskInfo(seriousViolation, judicial) {
  const svData = extractContentData(seriousViolation)
  const jdData = extractContentData(judicial)
  
  let riskCount = 0
  const risks = []
  
  if (svData) {
    if (Array.isArray(svData)) {
      riskCount += svData.length
      if (svData.length > 0) {
        risks.push(`严重违法失信记录 ${svData.length} 条`)
      }
    } else if (svData.total || svData.count) {
      riskCount += (svData.total || svData.count)
    }
  }
  
  if (jdData) {
    if (Array.isArray(jdData)) {
      riskCount += jdData.length
      if (jdData.length > 0) {
        risks.push(`司法判决记录 ${jdData.length} 条`)
      }
    } else if (jdData.total || jdData.count) {
      riskCount += (jdData.total || jdData.count)
    }
  }
  
  return {
    riskCount,
    riskSummary: risks.length > 0 ? risks.join('；') : '未发现重大风险记录',
    seriousViolation: svData,
    judicial: jdData
  }
}

/**
 * 解析经营信息
 */
function parseOperationInfo(bidding, qualification) {
  const bidData = extractContentData(bidding)
  const qualData = extractContentData(qualification)
  
  let bidCount = 0
  let certCount = 0
  
  if (bidData) {
    if (Array.isArray(bidData)) {
      bidCount = bidData.length
    } else if (bidData.total || bidData.count) {
      bidCount = bidData.total || bidData.count
    }
  }
  
  if (qualData) {
    if (Array.isArray(qualData)) {
      certCount = qualData.length
    } else if (qualData.total || qualData.count) {
      certCount = qualData.total || qualData.count
    }
  }
  
  return {
    bidCount,
    certificationCount: certCount,
    operationSummary: `招投标 ${bidCount} 条，资质 ${certCount} 项`,
    bidding: bidData,
    qualification: qualData
  }
}

/**
 * 解析知识产权信息
 */
function parseIPRInfo(patents, trademarks) {
  const patData = extractContentData(patents)
  const tmData = extractContentData(trademarks)
  
  let patentCount = 0
  let trademarkCount = 0
  
  if (patData) {
    if (Array.isArray(patData)) {
      patentCount = patData.length
    } else if (patData.total || patData.count) {
      patentCount = patData.total || patData.count
    }
  }
  
  if (tmData) {
    if (Array.isArray(tmData)) {
      trademarkCount = tmData.length
    } else if (tmData.total || tmData.count) {
      trademarkCount = tmData.total || tmData.count
    }
  }
  
  return {
    patentCount,
    trademarkCount,
    softwareCount: 0
  }
}

/**
 * 解析历史变更
 */
function parseHistoryInfo(result) {
  if (!result) return { changeCount: 0, summary: '暂无变更记录' }
  const data = extractContentData(result)
  
  let count = 0
  if (data) {
    if (Array.isArray(data)) {
      count = data.length
    } else if (data.total || data.count) {
      count = data.total || data.count
    }
  }
  
  return {
    changeCount: count,
    summary: count > 0 ? `查询到 ${count} 条变更记录` : '暂无变更记录',
    records: Array.isArray(data) ? data : []
  }
}

/**
 * 从MCP响应中提取数据内容
 */
function extractContentData(result) {
  if (!result) return null
  
  // 标准MCP响应格式：{content: [{type: 'text', text: '...'}]}
  if (Array.isArray(result.content)) {
    for (const item of result.content) {
      if (item.type === 'text' && item.text) {
        try {
          return typeof item.text === 'string' ? JSON.parse(item.text) : item.text
        } catch {
          return item.text
        }
      }
    }
  }
  
  // 直接的数据对象
  if (typeof result === 'object' && !result.content) {
    return result
  }
  
  return null
}
