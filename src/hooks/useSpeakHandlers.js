import { useCallback } from 'react'
import { useTTS } from './useTTS'

export function useSpeakHandlers() {
  const {
    speak,
    stop,
    isSpeaking,
    isPaused,
    canSpeak,
    isSupported: ttsSupported,
    detectTextLanguage
  } = useTTS()

  const handleSpeak = useCallback(async (text, language = null) => {
    if (!text || !text.trim()) return

    if (isSpeaking || isPaused) {
      stop()
      return
    }

    let speakLang = language
    if (!speakLang) {
      speakLang = detectTextLanguage(text)
    }

    await speak(text, { language: speakLang })
  }, [isSpeaking, isPaused, stop, detectTextLanguage, speak])

  return {
    handleSpeak,
    isSpeaking,
    isPaused,
    canSpeak,
    ttsSupported,
    detectTextLanguage
  }
}


