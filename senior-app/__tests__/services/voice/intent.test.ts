import { parseVoiceIntent, getExamplePhrases, VoiceIntent } from '../../src/app/services/voice/intent';

describe('Voice Intent Parser', () => {
  describe('Spanish Intent Parsing', () => {
    test('should parse CALL intent with name', () => {
      const result = parseVoiceIntent('llamar ana', 'es-ES');
      expect(result.intent).toBe('CALL');
      expect(result.confidence).toBe(0.9);
      expect(result.payload?.name).toBe('ana');
    });

    test('should parse CALL intent without name', () => {
      const result = parseVoiceIntent('llamar', 'es-ES');
      expect(result.intent).toBe('CALL');
      expect(result.confidence).toBe(0.9);
      expect(result.payload?.name).toBeUndefined();
    });

    test('should parse PHOTOS intent', () => {
      const result = parseVoiceIntent('ver fotos', 'es-ES');
      expect(result.intent).toBe('PHOTOS');
      expect(result.confidence).toBe(0.9);
    });

    test('should parse PHOTOS next intent', () => {
      const result = parseVoiceIntent('siguiente foto', 'es-ES');
      expect(result.intent).toBe('PHOTOS');
      expect(result.confidence).toBe(0.8);
      expect(result.payload?.direction).toBe('next');
    });

    test('should parse PHOTOS previous intent', () => {
      const result = parseVoiceIntent('anterior foto', 'es-ES');
      expect(result.intent).toBe('PHOTOS');
      expect(result.confidence).toBe(0.8);
      expect(result.payload?.direction).toBe('previous');
    });

    test('should parse SOS intent', () => {
      const result = parseVoiceIntent('emergencia', 'es-ES');
      expect(result.intent).toBe('SOS');
      expect(result.confidence).toBe(0.95);
    });

    test('should parse NAV_BACK intent', () => {
      const result = parseVoiceIntent('volver', 'es-ES');
      expect(result.intent).toBe('NAV_BACK');
      expect(result.confidence).toBe(0.9);
    });

    test('should parse NAV_HOME intent', () => {
      const result = parseVoiceIntent('inicio', 'es-ES');
      expect(result.intent).toBe('NAV_HOME');
      expect(result.confidence).toBe(0.9);
    });

    test('should parse READ intent', () => {
      const result = parseVoiceIntent('leer pantalla', 'es-ES');
      expect(result.intent).toBe('READ');
      expect(result.confidence).toBe(0.8);
    });

    test('should return UNKNOWN for unrecognized text', () => {
      const result = parseVoiceIntent('texto desconocido', 'es-ES');
      expect(result.intent).toBe('UNKNOWN');
      expect(result.confidence).toBe(0.0);
    });
  });

  describe('English Intent Parsing', () => {
    test('should parse CALL intent with name', () => {
      const result = parseVoiceIntent('call john', 'en-US');
      expect(result.intent).toBe('CALL');
      expect(result.confidence).toBe(0.9);
      expect(result.payload?.name).toBe('john');
    });

    test('should parse CALL intent without name', () => {
      const result = parseVoiceIntent('call', 'en-US');
      expect(result.intent).toBe('CALL');
      expect(result.confidence).toBe(0.9);
      expect(result.payload?.name).toBeUndefined();
    });

    test('should parse PHOTOS intent', () => {
      const result = parseVoiceIntent('show photos', 'en-US');
      expect(result.intent).toBe('PHOTOS');
      expect(result.confidence).toBe(0.9);
    });

    test('should parse PHOTOS next intent', () => {
      const result = parseVoiceIntent('next photo', 'en-US');
      expect(result.intent).toBe('PHOTOS');
      expect(result.confidence).toBe(0.8);
      expect(result.payload?.direction).toBe('next');
    });

    test('should parse PHOTOS previous intent', () => {
      const result = parseVoiceIntent('previous photo', 'en-US');
      expect(result.intent).toBe('PHOTOS');
      expect(result.confidence).toBe(0.8);
      expect(result.payload?.direction).toBe('previous');
    });

    test('should parse SOS intent', () => {
      const result = parseVoiceIntent('emergency', 'en-US');
      expect(result.intent).toBe('SOS');
      expect(result.confidence).toBe(0.95);
    });

    test('should parse NAV_BACK intent', () => {
      const result = parseVoiceIntent('go back', 'en-US');
      expect(result.intent).toBe('NAV_BACK');
      expect(result.confidence).toBe(0.9);
    });

    test('should parse NAV_HOME intent', () => {
      const result = parseVoiceIntent('home', 'en-US');
      expect(result.intent).toBe('NAV_HOME');
      expect(result.confidence).toBe(0.9);
    });

    test('should parse READ intent', () => {
      const result = parseVoiceIntent('read screen', 'en-US');
      expect(result.intent).toBe('READ');
      expect(result.confidence).toBe(0.8);
    });

    test('should return UNKNOWN for unrecognized text', () => {
      const result = parseVoiceIntent('unknown text', 'en-US');
      expect(result.intent).toBe('UNKNOWN');
      expect(result.confidence).toBe(0.0);
    });
  });

  describe('Example Phrases', () => {
    test('should return Spanish example phrases', () => {
      const phrases = getExamplePhrases('es-ES');
      expect(phrases).toContain('Llamar Ana');
      expect(phrases).toContain('Ver fotos');
      expect(phrases).toContain('Emergencia');
      expect(phrases).toContain('Volver');
      expect(phrases).toContain('Inicio');
      expect(phrases).toContain('Leer pantalla');
    });

    test('should return English example phrases', () => {
      const phrases = getExamplePhrases('en-US');
      expect(phrases).toContain('Call Ana');
      expect(phrases).toContain('Show photos');
      expect(phrases).toContain('Emergency');
      expect(phrases).toContain('Go back');
      expect(phrases).toContain('Home');
      expect(phrases).toContain('Read screen');
    });
  });
});
