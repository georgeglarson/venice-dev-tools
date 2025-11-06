/**
 * Types for Venice.ai Audio API
 */

/**
 * Available audio response formats
 */
export type AudioResponseFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

/**
 * Request to create speech from text
 */
export interface CreateSpeechRequest {
  /**
   * The text to generate audio for. The maximum length is 4096 characters.
   */
  input: string;

  /**
   * The model ID of a Venice TTS model.
   * @default "tts-kokoro"
   */
  model?: string;

  /**
   * The voice to use when generating the audio.
   * @default "af_sky"
   */
  voice?: string;

  /**
   * The format to audio in.
   * @default "mp3"
   */
  response_format?: AudioResponseFormat;

  /**
   * The speed of the generated audio.
   * Select a value from 0.25 to 4.0.
   * @default 1.0
   */
  speed?: number;

  /**
   * Should the content stream back sentence by sentence or be processed
   * and returned as a complete audio file.
   * @default false
   */
  streaming?: boolean;
}

/**
 * Available TTS models
 */
export const AUDIO_MODELS = {
  TTS_KOKORO: 'tts-kokoro',
} as const;

export type AudioModel = typeof AUDIO_MODELS[keyof typeof AUDIO_MODELS];

/**
 * Available voice options from Venice API
 */
export const VOICES = {
  // Female voices
  AF_ALLOY: 'af_alloy',
  AF_AOEDE: 'af_aoede',
  AF_BELLA: 'af_bella',
  AF_HEART: 'af_heart',
  AF_JADZIA: 'af_jadzia',
  AF_JESSICA: 'af_jessica',
  AF_KORE: 'af_kore',
  AF_NICOLE: 'af_nicole',
  AF_NOVA: 'af_nova',
  AF_RIVER: 'af_river',
  AF_SARAH: 'af_sarah',
  AF_SKY: 'af_sky',
  
  // Male voices
  AM_ADAM: 'am_adam',
  AM_ECHO: 'am_echo',
  AM_ERIC: 'am_eric',
  AM_FENRIR: 'am_fenrir',
  AM_LIAM: 'am_liam',
  AM_MICHAEL: 'am_michael',
  AM_ONYX: 'am_onyx',
  AM_PUCK: 'am_puck',
  AM_SANTA: 'am_santa',
  
  // British female voices
  BF_ALICE: 'bf_alice',
  BF_EMMA: 'bf_emma',
  BF_LILY: 'bf_lily',
  
  // British male voices
  BM_DANIEL: 'bm_daniel',
  BM_FABLE: 'bm_fable',
  BM_GEORGE: 'bm_george',
  BM_LEWIS: 'bm_lewis',
  
  // Chinese female voices
  ZF_XIAOBEI: 'zf_xiaobei',
  ZF_XIAONI: 'zf_xiaoni',
  ZF_XIAOXIAO: 'zf_xiaoxiao',
  ZF_XIAOYI: 'zf_xiaoyi',
  
  // Chinese male voices
  ZM_YUNJIAN: 'zm_yunjian',
  ZM_YUNXI: 'zm_yunxi',
  ZM_YUNXIA: 'zm_yunxia',
  ZM_YUNYANG: 'zm_yunyang',
  
  // French female voice
  FF_SIWIS: 'ff_siwis',
  
  // German female voices
  HF_ALPHA: 'hf_alpha',
  HF_BETA: 'hf_beta',
  
  // German male voices
  HM_OMEGA: 'hm_omega',
  HM_PSI: 'hm_psi',
  
  // Italian female voice
  IF_SARA: 'if_sara',
  
  // Italian male voice
  IM_NICOLA: 'im_nicola',
  
  // Japanese female voices
  JF_ALPHA: 'jf_alpha',
  JF_GONGITSUNE: 'jf_gongitsune',
  JF_NEZUMI: 'jf_nezumi',
  JF_TEBUKURO: 'jf_tebukuro',
  
  // Japanese male voice
  JM_KUMO: 'jm_kumo',
  
  // Portuguese female voices
  PF_DORA: 'pf_dora',
  
  // Portuguese male voices
  PM_ALEX: 'pm_alex',
  PM_SANTA: 'pm_santa',
  
  // Spanish female voices
  EF_DORA: 'ef_dora',
  
  // Spanish male voices
  EM_ALEX: 'em_alex',
  EM_SANTA: 'em_santa',
} as const;

export type Voice = typeof VOICES[keyof typeof VOICES];

/**
 * Response from audio generation API
 */
export interface CreateSpeechResponse {
  data: ArrayBuffer;
}
