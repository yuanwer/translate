import axios from 'axios'
import i18n from '../i18n'

export class OCRCorrectService {
  constructor() {
    this.name = 'OCR文字修正'
  }

  /**
   * 使用AI修正OCR识别错误的文字
   * @param {string} ocrText - OCR识别的原始文本
   * @param {object} config - AI服务配置
   * @returns {Promise<{correctedText: string, corrections: Array, confidence: number}>}
   */
  async correctText(ocrText, config = {}) {
    const { 
      url = 'https://api.openai.com/v1/chat/completions', 
      model = 'gpt-3.5-turbo', 
      apiKey, 
      serviceName = 'OpenAI' 
    } = config
    
    // Chrome AI特殊处理
    if (serviceName === 'Chrome Built-in AI' || url === 'chrome://ai-translate') {
      return await this.correctWithChromeAI(ocrText)
    }
    
    if (!apiKey) {
      throw new Error(i18n.t('errors.ocrCorrect.apiKeyRequired'))
    }

    if (!url) {
      throw new Error(i18n.t('errors.ocrCorrect.apiUrlRequired'))
    }

    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error(i18n.t('errors.ocrCorrect.emptyText'))
    }

    try {
      const prompt = this.buildCorrectionPrompt(ocrText)

      const response = await axios.post(
        url,
        {
          model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的OCR文字修正助手。你的任务是识别和修正OCR扫描文字中的常见错误，包括字符识别错误、标点符号错误、格式错误等。请保持原文的语义和结构。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // 使用较低的温度以获得更一致的修正结果
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
      
      return this.parseResponse(content, ocrText)
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error(i18n.t('errors.ocrCorrect.invalidApiKey'))
      } else if (error.response?.status === 429) {
        throw new Error(i18n.t('errors.ocrCorrect.rateLimited'))
      } else if (error.response?.status === 403) {
        throw new Error(i18n.t('errors.ocrCorrect.accessDenied'))
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error(i18n.t('errors.ocrCorrect.networkError'))
      } else {
        throw new Error(`${serviceName}${i18n.t('errors.ocrCorrect.apiError')}: ${error.response?.data?.error?.message || error.message}`)
      }
    }
  }

  /**
   * 使用Chrome内置AI进行文字修正
   */
  async correctWithChromeAI(ocrText) {
    try {
      if (!window.ai || !window.ai.languageModel) {
        throw new Error(i18n.t('errors.ocrCorrect.chromeAiNotAvailable'))
      }

      const session = await window.ai.languageModel.create({
        temperature: 0.1,
        topK: 1
      })

      const prompt = this.buildCorrectionPrompt(ocrText)
      const systemPrompt = '你是一个专业的OCR文字修正助手。请修正下面文本中的OCR识别错误，保持原意和格式。'
      
      const response = await session.prompt(`${systemPrompt}\n\n${prompt}`)
      
      session.destroy()

      return this.parseResponse(response, ocrText)
    } catch (error) {
      if (error.message.includes('not available')) {
        throw new Error(i18n.t('errors.ocrCorrect.chromeAiNotAvailable'))
      }
      throw new Error(`Chrome AI ${i18n.t('errors.ocrCorrect.apiError')}: ${error.message}`)
    }
  }

  /**
   * 构建修正提示词
   */
  buildCorrectionPrompt(ocrText) {
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

  /**
   * 解析AI返回的修正结果
   */
  parseResponse(content, originalText) {
    // 尝试解析结构化回复
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
      // 如果AI没有按格式返回，尝试使用整个内容作为修正结果
      // 但先检查是否明显是修正后的文本
      if (content.length > 10 && !content.includes('修正置信度')) {
        correctedText = content
        confidence = 5 // 默认中等置信度
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

    // 如果修正结果与原文相同，设置低置信度
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

  /**
   * 计算两个文本之间的差异
   */
  calculateDifferences(originalText, correctedText) {
    if (originalText === correctedText) {
      return []
    }

    const differences = []
    const original = originalText.split('')
    const corrected = correctedText.split('')
    
    // 简单的差异计算算法
    let i = 0, j = 0
    while (i < original.length && j < corrected.length) {
      if (original[i] !== corrected[j]) {
        // 找到不同的部分
        let origEnd = i
        let corrEnd = j
        
        // 向前查找直到找到匹配的字符
        while (origEnd < original.length && corrEnd < corrected.length && 
               original[origEnd] !== corrected[corrEnd]) {
          origEnd++
          corrEnd++
        }
        
        if (origEnd > i || corrEnd > j) {
          differences.push({
            type: 'change',
            originalStart: i,
            originalEnd: origEnd,
            correctedStart: j,
            correctedEnd: corrEnd,
            originalText: original.slice(i, origEnd).join(''),
            correctedText: corrected.slice(j, corrEnd).join('')
          })
        }
        
        i = origEnd
        j = corrEnd
      } else {
        i++
        j++
      }
    }
    
    return differences
  }
}

export const ocrCorrectService = new OCRCorrectService()