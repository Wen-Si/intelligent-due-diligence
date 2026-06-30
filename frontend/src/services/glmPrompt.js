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

# ⚠️ 核心约束（必须严格遵守）

## 数据使用铁律
1. **你的分析必须且只能基于用户提示词中提供的企查查数据和OCR财务报表内容。**
2. **严禁编造、虚构、臆测任何未在数据中明确提供的信息。**
3. 如果数据不足或某字段为"—"或空值，**必须在该处明确标注"数据缺失，待补充核查"**，绝不允许用编造的内容填充。
4. 所有数字、指标、结论**必须能在提供的数据中找到依据**，不得引用数据中不存在的信息。
5. 如果OCR解析的财务报表内容不完整或为空，在财务分析部分必须如实说明"OCR解析数据不完整，以下分析基于有限数据"，不得编造财务数据。
6. 如果企查查某模块数据获取失败，在该部分必须说明"企查查XX模块数据获取失败"，不得编造企业信息。

## 禁止行为
- ❌ 禁止编造财务数字（如资产负债率、毛利率等具体数值）
- ❌ 禁止编造企业工商信息（如成立日期、注册资本等）
- ❌ 禁止编造股东姓名、高管姓名
- ❌ 禁止编造诉讼案件、行政处罚等风险事件
- ❌ 禁止使用"假设"、"假设该公司"等方式编造场景

## 允许行为
- ✅ 基于提供的数据进行专业分析和推理
- ✅ 对数据中存在的指标进行计算和解读
- ✅ 提出行业一般性观点（但需标注"行业一般情况"）
- ✅ 建议需要进一步核查的事项

# 报告撰写要求

## 1. 报告结构（必须严格遵守）
报告应包含以下章节，使用Markdown格式输出：

# 一、执行摘要
（200-300字概括企业基本情况、核心发现、关键风险、整体评级。必须基于实际数据，不得编造。）

# 二、企业基本情况分析
## 2.1 企业概况
（基于企查查工商信息，介绍企业性质、注册资本、成立时间、股东结构等。如果企查查数据缺失，必须说明。）
## 2.2 股权结构分析
（分析股东背景、控股关系。如果股东数据缺失，必须说明。）
## 2.3 经营范围与业务定位
（基于经营范围字段分析主营业务、行业地位。）

# 三、财务分析
## 3.1 资产质量分析
（基于OCR解析的资产负债表数据。如果OCR数据不完整，必须说明哪些数据缺失。）
## 3.2 盈利能力分析
（基于OCR解析的利润表数据。）
## 3.3 偿债能力分析
## 3.4 运营效率分析
## 3.5 现金流分析

# 四、风险评估
## 4.1 经营风险
## 4.2 财务风险
## 4.3 法律风险
（基于企查查风险模块数据，不得编造诉讼案件。）
## 4.4 治理风险

# 五、综合评价与投资建议
## 5.1 综合评分
## 5.2 投资建议
## 5.3 后续尽调建议
（建议需要补充核查的事项。）

# 六、附录
（数据来源说明、免责声明）

## 2. 内容要求
- **数据驱动**：所有结论必须有数据支撑，引用具体数字
- **如实呈现**：数据缺失时必须明确标注，不得用编造内容替代
- **专业深度**：使用专业财务术语，体现专家水平
- **逻辑清晰**：层层递进，有理有据
- **客观中立**：既要发现亮点，也要指出风险
- **量化分析**：关键指标需量化展示
- **风险分级**：风险按高/中/低三级标注

## 3. 输出格式
- 使用 **Markdown** 格式
- 使用 # ## ### 表示章节层级
- 使用 **粗体** 突出重点
- 使用 > 引用重要发现
- 使用表格展示数据对比
- 使用 - 列举要点
- 报告字数控制在 3000-5000 字

现在请基于用户提供的企查查企业信息和OCR解析的财务报表内容，撰写完整专业的尽调报告。记住：**只能使用提供的数据，不得编造任何信息。**`


// ===== 用户提示词（User Prompt）构建器 =====
/**
 * 构建用户提示词
 * @param {string} companyName - 企业名称
 * @param {Object} qccData - 企查查MCP数据
 * @param {string} ocrText - OCR解析的财务报表文本
 * @param {Object} dataStatus - 数据获取状态
 */
export function buildUserPrompt(companyName, qccData, ocrText, dataStatus = {}) {
  // 将企查查数据格式化为字符串
  const qccText = formatQCCData(qccData)

  // OCR文本
  const ocrContent = (ocrText && ocrText.trim()) || ''
  const ocrLength = ocrContent.length

  // 构建数据状态说明
  const statusLines = []
  statusLines.push(`- 企业名称：${companyName}`)
  statusLines.push(`- 企查查数据获取：${dataStatus.qccSuccess ? `成功（${dataStatus.qccSuccessCount}/${dataStatus.qccTotalTools}个工具返回数据）` : '失败或部分失败'}`)
  statusLines.push(`- 企查查数据字符数：${qccText.length}`)
  statusLines.push(`- OCR财务报表解析：${ocrLength > 100 ? `成功（${ocrLength}字符）` : '数据不足或解析失败'}`)
  statusLines.push(`- OCR解析方法：${dataStatus.ocrMethod || 'pdf.js + GLM-4V视觉OCR'}`)
  statusLines.push(`- OCR文本字符数：${ocrLength}`)
  statusLines.push(`- PDF文件数：${dataStatus.pdfCount || 0}`)
  statusLines.push(`- PDF总页数：${dataStatus.totalPages || 0}`)

  return `# 待尽调企业：${companyName}

---

## 📋 数据获取状态说明

${statusLines.join('\n')}

> ⚠️ **重要提醒**：请严格基于以下实际获取的数据撰写报告。如果某部分数据显示为"—"或空值，请在报告对应部分标注"数据缺失，待补充核查"，**严禁编造任何未提供的信息**。

---

## 📊 第一部分：企查查企业信息（来自企查查MCP）

${qccText}

---

## 📄 第二部分：财务报表内容（来自GLM-4V视觉OCR解析）

${ocrContent || '> ⚠️ OCR解析未获取到有效文本内容。请在财务分析部分如实说明"OCR解析数据缺失"，不得编造财务数据。'}

---

## 📋 尽调任务

请基于以上**实际获取的**企业工商信息（企查查）和财务报表内容（OCR解析），按照系统提示词中要求的报告结构，撰写一份**完整、专业、深入**的企业尽职调查报告。

**再次强调：**
1. 只能使用以上提供的数据，不得编造
2. 数据缺失处必须明确标注
3. 所有结论必须有数据支撑
4. 如果OCR数据为空，财务分析部分应说明数据缺失，可基于企查查的经营范围等信息做定性分析

请使用Markdown格式输出，章节完整，逻辑清晰，数据驱动。`
}

// ===== 格式化企查查数据为字符串 =====
function formatQCCData(qccData) {
  if (!qccData) return '> （企查查数据获取失败，无企业工商信息）'

  const lines = []

  // 工商基本信息
  if (qccData.basic) {
    const b = qccData.basic
    lines.push('### 企业工商信息')
    lines.push('')
    lines.push('| 项目 | 内容 |')
    lines.push('|------|------|')
    lines.push(`| 企业名称 | ${b.companyName || '—'} |`)
    lines.push(`| 统一社会信用代码 | ${b.creditCode || '—'} |`)
    lines.push(`| 法定代表人 | ${b.legalPerson || '—'} |`)
    lines.push(`| 注册资本 | ${b.registeredCapital || '—'} |`)
    lines.push(`| 实缴资本 | ${b.paidInCapital || '—'} |`)
    lines.push(`| 成立日期 | ${b.establishmentDate || '—'} |`)
    lines.push(`| 企业类型 | ${b.companyType || '—'} |`)
    lines.push(`| 登记状态 | ${b.status || '—'} |`)
    lines.push(`| 所属行业 | ${b.industry || '—'} |`)
    lines.push(`| 注册地址 | ${b.address || '—'} |`)
    lines.push(`| 经营范围 | ${b.businessScope || '—'} |`)
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
  } else {
    lines.push('### 股东信息')
    lines.push('> （股东数据缺失）')
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
  } else {
    lines.push('### 主要管理人员')
    lines.push('> （高管数据缺失）')
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
    lines.push(`- **专利数量**：${qccData.ipr.patentCount || 0}`)
    lines.push(`- **商标数量**：${qccData.ipr.trademarkCount || 0}`)
    lines.push('')
  }

  // 历史变更
  if (qccData.history) {
    lines.push('### 历史变更')
    lines.push('')
    lines.push(`- **变更记录数**：${qccData.history.changeCount || 0}`)
    lines.push(`- **变更摘要**：${qccData.history.summary || '—'}`)
    lines.push('')
  }

  return lines.join('\n')
}


// ===== GLM-4.5 API 调用配置 =====
export const GLM_CONFIG = {
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: 'glm-4-flash',  // glm-4-flash 是 GLM-4.5-Flash 的官方API名
  apiKey: '325d6fa364954d2e871c30ba95b553bd.KBdQdqgJgELJBhnv',
  maxTokens: 4096,
  temperature: 0.3  // 较低温度保证专业严谨
}
