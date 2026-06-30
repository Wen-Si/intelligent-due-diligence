/**
 * GLM-4.5-Flash 尽调专用配置
 * 系统提示词 + 用户提示词模板
 */

// ===== 系统提示词（System Prompt）=====
// 设定角色为：企业尽职调查专家 + 尽调报告撰写专家
export const DUE_DILIGENCE_SYSTEM_PROMPT = `你是一位资深的**企业尽职调查专家**和**财务分析专家**，拥有20年以上的从业经验，曾为多家上市公司、国有企业和投资机构提供过专业的尽调咨询服务。

# 你的专业背景
- 注册会计师（CPA）、注册税务师、注册资产评估师
- 熟悉中国《公司法》、《证券法》、《企业会计准则》等相关法律法规
- 精通财务报表分析、风险评估、估值建模
- 累计完成超过500家企业尽职调查项目

# 你的工作职责
基于用户提供的企业工商信息（企查查数据）和财务报表内容（OCR解析结果），撰写一份**完整、专业、深入**的企业尽职调查报告。

# 报告撰写要求

## 1. 报告结构（必须严格遵守）
报告应包含以下章节，使用Markdown格式输出：

# 一、执行摘要
（200-300字概括企业基本情况、核心发现、关键风险、整体评级）

# 二、企业基本情况分析
## 2.1 企业概况
（基于企查查工商信息，介绍企业性质、注册资本、成立时间、股东结构等）
## 2.2 股权结构分析
（分析股东背景、控股关系、实际控制人）
## 2.3 经营范围与业务定位
（分析主营业务、行业地位）

# 三、财务分析
## 3.1 资产质量分析
（分析资产负债表关键科目、资产结构、流动性）
## 3.2 盈利能力分析
（分析利润表关键指标、毛利率、净利率、ROE等）
## 3.3 偿债能力分析
（资产负债率、流动比率、速动比率、利息保障倍数等）
## 3.4 运营效率分析
（应收账款周转率、存货周转率、总资产周转率等）
## 3.5 现金流分析
（经营活动现金流、投资活动现金流、筹资活动现金流）

# 四、风险评估
## 4.1 经营风险
（市场竞争、行业前景、客户集中度等）
## 4.2 财务风险
（杠杆水平、应收账款风险、存货风险等）
## 4.3 法律风险
（诉讼、仲裁、行政处罚、合规等）
## 4.4 治理风险
（管理层稳定性、内部控制、关联交易）

# 五、综合评价与投资建议
## 5.1 综合评分
（财务健康度评分、市场地位评分、管理水平评分、综合评级）
## 5.2 投资建议
（投资亮点、关注要点、风险提示）
## 5.3 后续尽调建议
（建议补充核查的事项）

# 六、附录
（数据来源说明、免责声明）

## 2. 内容要求
- **数据驱动**：所有结论必须有数据支撑，引用具体数字
- **专业深度**：使用专业财务术语，体现专家水平
- **逻辑清晰**：层层递进，有理有据
- **客观中立**：既要发现亮点，也要指出风险
- **结构化表达**：使用表格、列表等增强可读性
- **量化分析**：关键指标需量化展示
- **前后对比**：与行业平均水平对比
- **风险分级**：风险按高/中/低三级标注

## 3. 输出格式
- 使用 **Markdown** 格式
- 使用 # ## ### 表示章节层级
- 使用 **粗体** 突出重点
- 使用 > 引用重要发现
- 使用表格展示数据对比
- 使用 - 列举要点
- 报告字数控制在 3000-5000 字

## 4. 注意事项
- 如果数据不足，需明确说明并标注"待补充核查"
- 不得编造数据，所有结论必须基于提供的数据
- 对负面信息需客观呈现，不得回避
- 投资建议要谨慎、务实、专业

现在请基于用户提供的企查查企业信息和OCR解析的财务报表内容，撰写完整专业的尽调报告。`


// ===== 用户提示词（User Prompt）构建器 =====
export function buildUserPrompt(companyName, qccData, ocrText) {
  // 将企查查数据格式化为字符串
  const qccText = formatQCCData(qccData)
  
  // OCR文本已经是字符串，直接使用
  const ocrContent = ocrText || '（未提供财务报表内容）'
  
  return `# 待尽调企业：${companyName}

---

## 📊 第一部分：企查查企业信息（来自企查查MCP）

${qccText}

---

## 📄 第二部分：财务报表内容（来自PaddleOCR-VL-1.6解析）

${ocrContent}

---

## 📋 尽调任务

请基于以上企业工商信息（企查查）和财务报表内容（OCR解析），按照系统提示词中要求的报告结构，撰写一份**完整、专业、深入**的企业尽职调查报告。

**重点关注：**
1. 企业基本情况和股权结构
2. 财务三大表的深度分析（资产质量、盈利能力、偿债能力、运营效率、现金流）
3. 各类风险的识别与评估
4. 综合评级与投资建议

请使用Markdown格式输出，章节完整，逻辑清晰，数据驱动。`
}

// ===== 格式化企查查数据 =====
function formatQCCData(qccData) {
  if (!qccData) return '（无企查查数据）'
  
  const lines = []
  
  // 工商基本信息
  if (qccData.basic) {
    lines.push('### 企业工商信息')
    lines.push('')
    lines.push('| 项目 | 内容 |')
    lines.push('|------|------|')
    lines.push(`| 企业名称 | ${qccData.basic.companyName || '—'} |`)
    lines.push(`| 统一社会信用代码 | ${qccData.basic.creditCode || '—'} |`)
    lines.push(`| 法定代表人 | ${qccData.basic.legalPerson || '—'} |`)
    lines.push(`| 注册资本 | ${qccData.basic.registeredCapital || '—'} |`)
    lines.push(`| 实缴资本 | ${qccData.basic.paidInCapital || '—'} |`)
    lines.push(`| 成立日期 | ${qccData.basic.establishmentDate || '—'} |`)
    lines.push(`| 营业期限 | ${qccData.basic.operatingPeriod || '—'} |`)
    lines.push(`| 企业类型 | ${qccData.basic.companyType || '—'} |`)
    lines.push(`| 经营状态 | ${qccData.basic.status || '—'} |`)
    lines.push(`| 所属行业 | ${qccData.basic.industry || '—'} |`)
    lines.push(`| 注册地址 | ${qccData.basic.address || '—'} |`)
    lines.push(`| 经营范围 | ${qccData.basic.businessScope || '—'} |`)
    lines.push('')
  }
  
  // 股东信息
  if (qccData.shareholders && qccData.shareholders.length > 0) {
    lines.push('### 股东信息')
    lines.push('')
    lines.push('| 股东名称 | 出资比例 | 出资金额 |')
    lines.push('|---------|---------|---------|')
    qccData.shareholders.forEach(sh => {
      lines.push(`| ${sh.name || '—'} | ${sh.percentage || '—'} | ${sh.amount || '—'} |`)
    })
    lines.push('')
  }
  
  // 高管信息
  if (qccData.executives && qccData.executives.length > 0) {
    lines.push('### 主要管理人员')
    lines.push('')
    lines.push('| 姓名 | 职务 |')
    lines.push('|------|------|')
    qccData.executives.forEach(ex => {
      lines.push(`| ${ex.name || '—'} | ${ex.position || '—'} |`)
    })
    lines.push('')
  }
  
  // 风险信息
  if (qccData.risk) {
    lines.push('### 风险信息')
    lines.push('')
    lines.push(`- **风险数量**：${qccData.risk.riskCount || 0}`)
    lines.push(`- **风险摘要**：${qccData.risk.riskSummary || '—'}`)
    lines.push('')
  }
  
  // 经营信息
  if (qccData.operation) {
    lines.push('### 经营信息')
    lines.push('')
    lines.push(`- **招投标记录**：${qccData.operation.bidCount || 0} 条`)
    lines.push(`- **资质证书**：${qccData.operation.certificationCount || 0} 项`)
    lines.push(`- **经营摘要**：${qccData.operation.operationSummary || '—'}`)
    lines.push('')
  }
  
  // 知识产权
  if (qccData.ipr) {
    lines.push('### 知识产权')
    lines.push('')
    lines.push(`- **商标数量**：${qccData.ipr.trademarkCount || 0}`)
    lines.push(`- **专利数量**：${qccData.ipr.patentCount || 0}`)
    lines.push(`- **软件著作权**：${qccData.ipr.softwareCount || 0}`)
    lines.push('')
  }
  
  return lines.join('\n')
}


// ===== GLM-4.5 API 调用配置 =====
export const GLM_CONFIG = {
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4-flash',  // glm-4-flash 是 GLM-4.5-Flash 的官方API名
  apiKey: '325d6fa364954d2e871c30ba95b553bd.KBdQdqgJgELJBhnv',
  maxTokens: 4000,
  temperature: 0.3  // 较低温度保证专业严谨
}