import i18n from '../i18n'
import { correctWithChatAPI, buildCorrectionPrompt, parseCorrectionResponse } from './providers/ocrCorrectProvider'

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
    
    return await correctWithChatAPI(ocrText, { url, model, apiKey, serviceName })
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
    return buildCorrectionPrompt(ocrText)
  }

  /**
   * 解析AI返回的修正结果
   */
  parseResponse(content, originalText) {
    return parseCorrectionResponse(content, originalText)
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