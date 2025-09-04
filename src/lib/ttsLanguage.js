// TTS 相关语言映射与检测工具

export const LANGUAGE_TO_VOICE_LOCALE = {
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'en': 'en-US',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'es': 'es-ES',
  'ru': 'ru-RU',
  'ar': 'ar-SA',
  'hi': 'hi-IN',
  'pt': 'pt-BR',
  'it': 'it-IT',
  'th': 'th-TH',
  'vi': 'vi-VN'
}

export function mapToVoiceLocale(langCode) {
  return LANGUAGE_TO_VOICE_LOCALE[langCode] || langCode
}

export function detectTextLanguageSimple(text) {
  if (!text || text.trim().length === 0) {
    return 'en'
  }

  const chineseRegex = /[\u4e00-\u9fff]/g
  const chineseMatches = text.match(chineseRegex) || []
  const chineseRatio = chineseMatches.length / text.replace(/\s/g, '').length
  if (chineseRatio > 0.3) {
    const traditionalChars = /[繁體傳統]/g
    if (traditionalChars.test(text)) {
      return 'zh-TW'
    }
    return 'zh-CN'
  }

  if (/[\u3040-\u309f\u30a0-\u30ff]/g.test(text)) return 'ja'
  if (/[\uac00-\ud7af]/g.test(text)) return 'ko'
  if (/[\u0600-\u06ff]/g.test(text)) return 'ar'

  return 'en'
}


