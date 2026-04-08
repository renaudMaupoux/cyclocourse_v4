/**
 * Extraction des chiffres 1–1000 à partir de texte (Web Speech API → POST /recognize-text).
 * Aucune dépendance cloud.
 */

export interface TranscriptAlternative {
  transcript: string;
  confidence: number;
}

class VoiceRecognitionService {
  recognizeFromText(text: string, confidence = 0.82): DetectedNumberForCreate[] {
    if (!text || typeof text !== 'string') {
      return [];
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return [];
    }
    const transcription: TranscriptAlternative[] = [{ transcript: trimmed, confidence }];
    return this.extractNumbers(transcription);
  }

  extractNumbers(transcription: TranscriptAlternative[]): DetectedNumberForCreate[] {
    const numbers: DetectedNumberForCreate[] = [];

    transcription.forEach((alt) => {
      const text = alt.transcript;
      const conf = typeof alt.confidence === 'number' ? alt.confidence : 0.8;

      console.log(`📝 Transcription: "${text}" (confiance: ${conf.toFixed(2)})`);

      const matches = this.parseNumbersFromText(text);

      matches.forEach((num) => {
        if (num >= 1 && num <= 1000) {
          numbers.push({
            value: num,
            originalValue: num,
            confidence: conf,
            originalText: text,
            isEdited: false
          });
          console.log(`✔️ Chiffre extrait: ${num}`);
        } else {
          console.log(`⚠️ Chiffre hors plage ignoré: ${num}`);
        }
      });
    });

    return numbers;
  }

  parseNumbersFromText(text: string): number[] {
    const numbers: number[] = [];

    const numericMatches = text.match(/\d+/g);
    if (numericMatches) {
      numbers.push(...numericMatches.map((n) => parseInt(n, 10)));
    }

    const frenchNumbers = this.convertFrenchWordsToNumbers(text);
    if (frenchNumbers.length > 0) {
      numbers.push(...frenchNumbers);
    }

    return numbers;
  }

  convertFrenchWordsToNumbers(text: string): number[] {
    const numbers: number[] = [];
    const lowerText = text.toLowerCase().trim();

    const simpleNumbers: Record<string, number> = {
      un: 1,
      deux: 2,
      trois: 3,
      quatre: 4,
      cinq: 5,
      six: 6,
      sept: 7,
      huit: 8,
      neuf: 9,
      dix: 10,
      onze: 11,
      douze: 12,
      treize: 13,
      quatorze: 14,
      quinze: 15,
      seize: 16,
      vingt: 20,
      trente: 30,
      quarante: 40,
      cinquante: 50,
      soixante: 60,
      cent: 100,
      mille: 1000
    };

    for (const [word, value] of Object.entries(simpleNumbers)) {
      if (
        lowerText === word ||
        lowerText.includes(` ${word} `) ||
        lowerText.startsWith(`${word} `) ||
        lowerText.endsWith(` ${word}`)
      ) {
        numbers.push(value);
      }
    }

    const centMatch = lowerText.match(/(\d+)\s*cent/);
    if (centMatch) {
      numbers.push(parseInt(centMatch[1]!, 10) * 100);
    }

    return numbers;
  }
}

/** Champs attendus par Sequelize pour Number.create (hors id / timestamps auto) */
export interface DetectedNumberForCreate {
  value: number;
  originalValue: number;
  confidence: number;
  originalText: string;
  isEdited: boolean;
}

export default new VoiceRecognitionService();
