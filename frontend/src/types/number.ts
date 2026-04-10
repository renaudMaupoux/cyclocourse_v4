/** Chiffre persisté (API + WebSocket) */
export interface NumberEntry {
  id: string;
  value: number;
  confidence: number;
  isEdited?: boolean;
  timestamp?: string;
}

export interface NumbersListResponse {
  success: boolean;
  count: number;
  data: NumberEntry[];
}

export interface NumberSingleResponse {
  success: boolean;
  data: NumberEntry;
}

export interface VoiceRecognizeResponse {
  success: boolean;
  data: NumberEntry[];
}
