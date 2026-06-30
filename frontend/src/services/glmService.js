/**
 * GLM-4.5-Flash API 服务
 * 通过智谱AI开放平台调用大模型生成尽调报告
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
    console.log('--- 响应内容前300字预览 ---')
    console.log(content.substring(0, 300))
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
