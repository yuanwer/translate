import axios from 'axios'
import i18n from '../../i18n'

export function buildCorrectionPrompt(ocrText) {
  return `请修正以下OCR识别文本中可能存在的错误。常见的OCR错误包括：

1. 字符识别错误（如：l与I，0与O，m与rn等混淆）
2. 标点符号错误（如：。与·，，与'等）
3. 空格和换行问题
4. 中英文混合时的间距问题
5. 数字和字母的混淆

请按以下格式返回结果：

修正置信度: [1-10的数字，表示修正的必要性]
修正结果: [修正后的完整文本]
主要修正: [列出主要的修正点，格式：原文->修正文]

原始OCR文本：
${ocrText}`
}

export function parseCorrectionResponse(content, originalText) {
  const confidenceMatch = content.match(/修正置信度:\s*(\d+)/)
  const correctedMatch = content.match(/修正结果:\s*([\s\S]*?)(?=主要修正:|$)/)
  const correctionsMatch = content.match(/主要修正:\s*([\s\S]*)/)

  let correctedText = originalText
  let confidence = 0
  let corrections = []

  if (confidenceMatch) {
    confidence = parseInt(confidenceMatch[1]) || 0
  }

  if (correctedMatch) {
    correctedText = correctedMatch[1].trim()
  } else {
    if (content.length > 10 && !content.includes('修正置信度')) {
      correctedText = content
      confidence = 5
    }
  }

  if (correctionsMatch) {
    const correctionLines = correctionsMatch[1].split('\n')
    corrections = correctionLines
      .filter(line => line.includes('->'))
      .map(line => {
        const [original, corrected] = line.split('->').map(s => s.trim())
        return { original, corrected }
      })
  }

  if (correctedText === originalText) {
    confidence = 0
  }

  return {
    correctedText,
    confidence,
    corrections,
    hasChanges: correctedText !== originalText
  }
}

export async function correctWithChatAPI(ocrText, { url, model, apiKey, serviceName }) {
  if (!apiKey) throw new Error(i18n.t('errors.ocrCorrect.apiKeyRequired'))
  if (!url) throw new Error(i18n.t('errors.ocrCorrect.apiUrlRequired'))
  if (!ocrText || ocrText.trim().length === 0) throw new Error(i18n.t('errors.ocrCorrect.emptyText'))

  try {
    const prompt = buildCorrectionPrompt(ocrText)
    const response = await axios.post(
      url,
      {
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的OCR文字修正助手。你的任务是识别和修正OCR扫描文字中的常见错误，包括字符识别错误、标点符号错误、格式错误等。请保持原文的语义和结构。'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 3000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error(i18n.t('errors.ocrCorrect.responseFormatError'))
    }

    const content = response.data.choices[0].message.content.trim()
    return parseCorrectionResponse(content, ocrText)
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(i18n.t('errors.ocrCorrect.invalidApiKey'))
    } else if (error.response?.status === 429) {
      throw new Error(i18n.t('errors.ocrCorrect.rateLimited'))
    } else if (error.response?.status === 403) {
      throw new Error(i18n.t('errors.ocrCorrect.accessDenied'))
    } else if (error.code === 'NETWORK_ERROR' || (error.message || '').includes('Network Error')) {
      throw new Error(i18n.t('errors.ocrCorrect.networkError'))
    } else {
      throw new Error(`${serviceName}${i18n.t('errors.ocrCorrect.apiError')}: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}


