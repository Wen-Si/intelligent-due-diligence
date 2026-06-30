/**
 * GLM-4.5-Flash API 服务
 * 通过智谱AI开放平台调用大模型生成尽调报告
 * 包含GLM-4V视觉OCR功能用于PDF文档识别
 */
import { GLM_CONFIG, DUE_DILIGENCE_SYSTEM_PROMPT, buildUserPrompt } from './glmPrompt'

/**
 * 调用GLM-4.5-Flash生成尽调报告
 * @param {string} companyName - 企业名称
 * @param {Object} qccData - 企查查MCP数据
 * @param {string} ocrText - OCR解析的财务报表文本
 * @param {Object} dataStatus - 数据获取状态
 * @returns {Promise<Object>} AI生成的Markdown报告
 */
export async function callGLM45(companyName, qccData, ocrText, dataStatus = {}) {
  const systemPrompt = DUE_DILIGENCE_SYSTEM_PROMPT
  const userPrompt = buildUserPrompt(companyName, qccData, ocrText, dataStatus)

  console.log('======= 调用GLM-4.5-Flash =======')
  console.log('System Prompt长度:', systemPrompt.length)
  console.log('User Prompt长度:', userPrompt.length)
  console.log('企查查数据状态:', dataStatus.qccSuccess ? '成功' : '失败')
  console.log('OCR文本长度:', (ocrText || '').length)
  console.log('OCR文本前200字:', (ocrText || '').substring(0, 200))
  console.log('--- User Prompt 前500字预览 ---')
  console.log(userPrompt.substring(0, 500))
  console.log('--- User Prompt 结束 ---')

  try {
    const response = await fetch(GLM_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: GLM_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: GLM_CONFIG.maxTokens,
        temperature: GLM_CONFIG.temperature,
        top_p: 0.9,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GLM API调用失败 (${response.status}): ${errorText}`)
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('GLM API返回数据为空')
    }

    const content = data.choices[0].message?.content || ''
    console.log('======= GLM-4.5-Flash响应 =======')
    console.log('响应内容长度:', content.length)
    console.log('Tokens使用:', data.usage)
    console.log('--- 响应内容前500字预览 ---')
    console.log(content.substring(0, 500))
    console.log('--- 响应预览结束 ---')

    return {
      content,
      usage: data.usage || {},
      model: data.model || GLM_CONFIG.model
    }

  } catch (error) {
    console.error('GLM-4.5-Flash调用错误:', error)
    throw error
  }
}

/**
 * 使用GLM-4V视觉模型对PDF页面图片进行OCR
 * 将图片发送给GLM-4V-Flash，让模型识别并提取所有文字内容
 * 
 * @param {string} base64Image - base64编码的图片（含data:image/jpeg;base64,前缀）
 * @param {number} pageNum - 页码
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @returns {Promise<string>} 提取的文本内容
 */
export async function OCRWithGLM4V(base64Image, pageNum, width, height) {
  const ocrPrompt = `这是一份企业财务报表PDF的第${pageNum}页。请仔细识别图片中的所有文字内容，包括：

1. 标题、表头、正文文字
2. 表格中的所有数据（请保持表格结构，用|分隔列，用换行分隔行）
3. 数字、百分比、金额（保留原始格式）
4. 注释、脚注
5. 日期、单位等信息

要求：
- 完整提取所有可见文字，不要遗漏
- 保持原始的层次结构和格式
- 表格数据用Markdown表格格式输出
- 数字保持原文，不要修改或计算
- 如果有图表，描述其内容和数据
- 只输出识别到的文字内容，不要添加任何解释或评论

请直接输出识别结果：`

  console.log(`GLM-4V OCR: 发送第${pageNum}页图片 (${width}x${height})`)

  try {
    const response = await fetch(GLM_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: ocrPrompt },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
        stream: false
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GLM-4V API失败 (${response.status}): ${errorText.substring(0, 200)}`)
    }

    const data = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error('GLM-4V返回数据为空')
    }

    const text = data.choices[0].message?.content || ''
    console.log(`GLM-4V OCR: 第${pageNum}页成功, 提取${text.length}字符, tokens:`, data.usage)

    return text
  } catch (error) {
    console.error(`GLM-4V OCR错误 (第${pageNum}页):`, error.message)
    throw error
  }
}

/**
 * 流式调用GLM-4.5-Flash（可选，用于实时显示生成过程）
 */
export async function callGLM45Stream(companyName, qccData, ocrText, dataStatus, onChunk) {
  const systemPrompt = DUE_DILIGENCE_SYSTEM_PROMPT
  const userPrompt = buildUserPrompt(companyName, qccData, ocrText, dataStatus)

  try {
    const response = await fetch(GLM_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: GLM_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: GLM_CONFIG.maxTokens,
        temperature: GLM_CONFIG.temperature,
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`GLM API失败: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6)
          if (dataStr === '[DONE]') continue

          try {
            const data = JSON.parse(dataStr)
            const delta = data.choices?.[0]?.delta?.content || ''
            if (delta) {
              fullContent += delta
              if (onChunk) onChunk(delta, fullContent)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent

  } catch (error) {
    console.error('GLM流式调用错误:', error)
    throw error
  }
}
