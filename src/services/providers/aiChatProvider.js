import axios from 'axios'
import i18n from '../../i18n'
import { getLanguageName } from '../../lib/language'

function buildTranslatePrompt(text, sourceLang, targetLang, enableWebSearch) {
  const sourceLangName = getLanguageName(sourceLang)
  const targetLangName = getLanguageName(targetLang)
  const webSearchTip = enableWebSearch ? '请结合最新信息和实时数据进行翻译，确保翻译内容的准确性和时效性。' : ''

  if (sourceLang === 'auto') {
    return `请将以下文本翻译成${targetLangName}。${webSearchTip}请按以下格式返回结果：

检测语言: [检测到的源语言代码，如zh、en、ja等]
翻译结果: [翻译后的文本]

原文：
${text}`
  }

  return `请将以下${sourceLangName}文本翻译成${targetLangName}。${webSearchTip}请按以下格式返回结果：

检测语言: ${sourceLang}
翻译结果: [翻译后的文本]

原文：
${text}`
}

export async function translate(text, sourceLang, targetLang, config) {
  const {
    url,
    model,
    apiKey,
    serviceName,
    enableWebSearch = false
  } = config

  if (!apiKey) {
    throw new Error(i18n.t('errors.translate.apiKeyRequired'))
  }

  if (!url) {
    throw new Error(i18n.t('errors.translate.apiUrlRequired'))
  }

  try {
    const prompt = buildTranslatePrompt(text, sourceLang, targetLang, enableWebSearch)

    const requestBody = {
      model,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }

    if (enableWebSearch) {
      requestBody.enable_search = true
    }

    const response = await axios.post(
      url,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error(i18n.t('errors.translate.responseFormatError'))
    }

    const content = response.data.choices[0].message.content.trim()

    let translatedText = content
    let detectedLanguage = sourceLang

    const detectMatch = content.match(/检测语言:\s*([a-zA-Z-]+)/)
    const translateMatch = content.match(/翻译结果:\s*([\s\S]+)/)

    if (detectMatch && translateMatch) {
      detectedLanguage = detectMatch[1].toLowerCase()
      translatedText = translateMatch[1].trim()
    } else {
      translatedText = content
    }

    return {
      translatedText,
      detectedSourceLanguage: detectedLanguage,
      service: serviceName?.toLowerCase?.() || 'unknown'
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(i18n.t('errors.translate.invalidApiKey'))
    } else if (error.response?.status === 429) {
      throw new Error(i18n.t('errors.translate.rateLimited'))
    } else if (error.response?.status === 403) {
      throw new Error(i18n.t('errors.translate.accessDenied'))
    } else if (error.code === 'NETWORK_ERROR' || (error.message || '').includes('Network Error')) {
      throw new Error(i18n.t('errors.translate.networkError'))
    } else {
      throw new Error(`${serviceName}${i18n.t('errors.translate.apiError')}: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}

export async function formatToTable(text, config) {
  const {
    url,
    model,
    apiKey,
    serviceName
  } = config

  if (!apiKey) {
    throw new Error(i18n.t('errors.tableFormat.apiKeyRequired'))
  }

  if (!url) {
    throw new Error(i18n.t('errors.tableFormat.apiUrlRequired'))
  }

  if (!text || !text.trim()) {
    throw new Error(i18n.t('errors.tableFormat.emptyText'))
  }

  try {
    const prompt = `请将以下文本内容整理为表格格式。根据文本内容的特点，智能识别并提取关键信息，生成结构化的Markdown表格。

要求：
1. 分析文本内容，识别可以表格化的信息（如数据对比、属性列表、时间序列、分类信息等）
2. 提取关键字段作为表格列标题
3. 将相关信息按行组织
4. 使用标准的Markdown表格格式输出
5. 如果文本不适合表格化，请说明原因并提供其他结构化建议

请直接输出整理后的Markdown表格，无需其他说明文字：

${text}`

    const response = await axios.post(
      url,
      {
        model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error(i18n.t('errors.tableFormat.responseFormatError'))
    }

    const content = response.data.choices[0].message.content.trim()

    return {
      formattedText: content,
      service: serviceName?.toLowerCase?.() || 'unknown'
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(i18n.t('errors.tableFormat.invalidApiKey'))
    } else if (error.response?.status === 429) {
      throw new Error(i18n.t('errors.tableFormat.rateLimited'))
    } else if (error.response?.status === 403) {
      throw new Error(i18n.t('errors.tableFormat.accessDenied'))
    } else if (error.code === 'NETWORK_ERROR' || (error.message || '').includes('Network Error')) {
      throw new Error(i18n.t('errors.tableFormat.networkError'))
    } else {
      throw new Error(`${serviceName}${i18n.t('errors.tableFormat.apiError')}: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}

// 将图片发送给视觉模型，提取其中的可读文字，返回纯文本
export async function extractTextFromImage(image, config) {
  const {
    url,
    model,
    visionModel,
    apiKey,
    serviceName
  } = config

  if (!apiKey) {
    throw new Error(i18n.t('messages.apiKeyRequired'))
  }

  if (!url) {
    throw new Error(i18n.t('messages.testRequired'))
  }

  const ensureDataUrl = (img) => new Promise((resolve, reject) => {
    try {
      if (typeof img === 'string' && img.startsWith('data:')) {
        resolve(img)
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = (e) => reject(new Error('Failed to read image'))
      reader.readAsDataURL(img)
    } catch (err) {
      reject(err)
    }
  })

  try {
    const dataUrl = await ensureDataUrl(image)
    const usedModel = visionModel || model

    const prompt = '请从这张图片中提取可读文字，按原文顺序输出纯文本。仅返回提取的文字，不要任何额外说明。'

    const requestBody = {
      model: usedModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }
      ],
      temperature: 0,
      max_tokens: 2000
    }

    const response = await axios.post(
      url,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const content = response.data?.choices?.[0]?.message?.content?.trim?.()
    if (!content) {
      throw new Error(i18n.t('ocr.noTextFound'))
    }

    return { text: content, service: serviceName?.toLowerCase?.() || 'unknown' }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(i18n.t('errors.translate.invalidApiKey'))
    } else if (error.response?.status === 429) {
      throw new Error(i18n.t('errors.translate.rateLimited'))
    } else if (error.response?.status === 403) {
      throw new Error(i18n.t('errors.translate.accessDenied'))
    } else if (error.code === 'NETWORK_ERROR' || (error.message || '').includes('Network Error')) {
      throw new Error(i18n.t('errors.translate.networkError'))
    } else {
      throw new Error(`${serviceName}${i18n.t('errors.translate.apiError')}: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}


