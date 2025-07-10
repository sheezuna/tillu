'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@tillu/ui'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  onResult: (transcript: string) => void
  isListening: boolean
  onToggle: () => void
}

export function VoiceInput({ onResult, isListening, onToggle }: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant={isListening ? "danger" : "secondary"}
      size="sm"
      onClick={onToggle}
      className="flex items-center space-x-2"
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      <span>{isListening ? 'Stop' : 'Voice'}</span>
    </Button>
  )
}
