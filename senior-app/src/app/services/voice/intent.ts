export type VoiceIntent = 
  | 'CALL'
  | 'PHOTOS'
  | 'SOS'
  | 'NAV_BACK'
  | 'NAV_HOME'
  | 'READ'
  | 'UNKNOWN';

export interface IntentResult {
  intent: VoiceIntent;
  confidence: number;
  payload?: {
    name?: string; // for CALL intent
    direction?: 'next' | 'previous'; // for PHOTOS intent
  };
}

/**
 * Parse voice command transcript to determine intent
 */
export function parseVoiceIntent(transcript: string, language: 'es-ES' | 'en-US' = 'en-US'): IntentResult {
  const normalizedTranscript = transcript.toLowerCase().trim();
  
  // Spanish patterns
  if (language === 'es-ES') {
    return parseSpanishIntent(normalizedTranscript);
  }
  
  // English patterns
  return parseEnglishIntent(normalizedTranscript);
}

function parseSpanishIntent(transcript: string): IntentResult {
  // CALL patterns
  if (transcript.includes('llamar') || transcript.includes('llama')) {
    const name = extractNameFromCall(transcript, 'llamar', 'llama');
    return {
      intent: 'CALL',
      confidence: 0.9,
      payload: { name }
    };
  }

  // PHOTOS patterns
  if (transcript.includes('ver fotos') || transcript.includes('mostrar fotos') || transcript.includes('fotos')) {
    if (transcript.includes('siguiente') || transcript.includes('siguiente foto')) {
      return {
        intent: 'PHOTOS',
        confidence: 0.8,
        payload: { direction: 'next' }
      };
    }
    if (transcript.includes('anterior') || transcript.includes('anterior foto')) {
      return {
        intent: 'PHOTOS',
        confidence: 0.8,
        payload: { direction: 'previous' }
      };
    }
    return {
      intent: 'PHOTOS',
      confidence: 0.9,
      payload: {}
    };
  }

  // SOS patterns
  if (transcript.includes('emergencia') || transcript.includes('ayuda') || transcript.includes('sos')) {
    return {
      intent: 'SOS',
      confidence: 0.95,
      payload: {}
    };
  }

  // NAVIGATION patterns
  if (transcript.includes('volver') || transcript.includes('atrás') || transcript.includes('regresar')) {
    return {
      intent: 'NAV_BACK',
      confidence: 0.9,
      payload: {}
    };
  }

  if (transcript.includes('inicio') || transcript.includes('casa') || transcript.includes('home')) {
    return {
      intent: 'NAV_HOME',
      confidence: 0.9,
      payload: {}
    };
  }

  // READ patterns
  if (transcript.includes('leer') || transcript.includes('lee') || transcript.includes('leer pantalla')) {
    return {
      intent: 'READ',
      confidence: 0.8,
      payload: {}
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.0,
    payload: {}
  };
}

function parseEnglishIntent(transcript: string): IntentResult {
  // CALL patterns
  if (transcript.includes('call') || transcript.includes('phone')) {
    const name = extractNameFromCall(transcript, 'call', 'phone');
    return {
      intent: 'CALL',
      confidence: 0.9,
      payload: { name }
    };
  }

  // PHOTOS patterns
  if (transcript.includes('show photos') || transcript.includes('photos') || transcript.includes('pictures')) {
    if (transcript.includes('next') || transcript.includes('next photo')) {
      return {
        intent: 'PHOTOS',
        confidence: 0.8,
        payload: { direction: 'next' }
      };
    }
    if (transcript.includes('previous') || transcript.includes('previous photo')) {
      return {
        intent: 'PHOTOS',
        confidence: 0.8,
        payload: { direction: 'previous' }
      };
    }
    return {
      intent: 'PHOTOS',
      confidence: 0.9,
      payload: {}
    };
  }

  // SOS patterns
  if (transcript.includes('emergency') || transcript.includes('help') || transcript.includes('sos')) {
    return {
      intent: 'SOS',
      confidence: 0.95,
      payload: {}
    };
  }

  // NAVIGATION patterns
  if (transcript.includes('back') || transcript.includes('go back') || transcript.includes('return')) {
    return {
      intent: 'NAV_BACK',
      confidence: 0.9,
      payload: {}
    };
  }

  if (transcript.includes('home') || transcript.includes('main') || transcript.includes('start')) {
    return {
      intent: 'NAV_HOME',
      confidence: 0.9,
      payload: {}
    };
  }

  // READ patterns
  if (transcript.includes('read') || transcript.includes('read screen') || transcript.includes('tell me')) {
    return {
      intent: 'READ',
      confidence: 0.8,
      payload: {}
    };
  }

  return {
    intent: 'UNKNOWN',
    confidence: 0.0,
    payload: {}
  };
}

/**
 * Extract name from call commands
 */
function extractNameFromCall(transcript: string, ...callWords: string[]): string | undefined {
  for (const callWord of callWords) {
    const index = transcript.indexOf(callWord);
    if (index !== -1) {
      // Get text after the call word
      const afterCall = transcript.substring(index + callWord.length).trim();
      // Remove common words and return the name
      const name = afterCall
        .replace(/\b(to|a|para)\b/g, '')
        .trim();
      return name || undefined;
    }
  }
  return undefined;
}

/**
 * Get example phrases for the current language
 */
export function getExamplePhrases(language: 'es-ES' | 'en-US'): string[] {
  if (language === 'es-ES') {
    return [
      'Llamar Ana',
      'Ver fotos',
      'Emergencia',
      'Volver',
      'Inicio',
      'Leer pantalla'
    ];
  }
  
  return [
    'Call Ana',
    'Show photos',
    'Emergency',
    'Go back',
    'Home',
    'Read screen'
  ];
}
