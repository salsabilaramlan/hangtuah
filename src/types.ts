export type TimeOfDay = 'pagi' | 'senja' | 'malam';

export interface BackgroundSettings {
  timeOfDay: TimeOfDay;
  particlesEnabled: boolean;
  cloudsEnabled: boolean;
  waterWavesEnabled: boolean;
  fogDensity: number;
  bloomGlow: boolean;
}

export interface DialogItem {
  speaker: string;
  avatar: string;
  type: 'fact' | 'lore';
  text: string;
}

export interface ScrollItem {
  id: string;
  x: number;
  z: number;
  title: string;
  fact: string;
  collected: boolean;
}

export interface HerbItem {
  x: number;
  z: number;
  collected: boolean;
}

export interface EnemyItem {
  id: string;
  name: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  rotY: number;
  weaponMeshName?: string;
}

export interface NPCItem {
  id: string;
  name: string;
  x: number;
  z: number;
  rotY: number;
  dialog: string;
  meshType: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface StageData {
  id: number;
  name: string;
  banner: string;
  theme: 'pekan' | 'laut' | 'istana';
  skyColors: {
    zenith: [number, number, number];
    horizon: [number, number, number];
    fog: [number, number, number];
    sun: [number, number, number];
  };
  dialogs: DialogItem[];
  scrolls?: {
    id: string;
    x: number;
    z: number;
    title: string;
    fact: string;
  }[];
  herbs?: { x: number; z: number }[];
  enemies?: {
    id: string;
    name: string;
    x: number;
    z: number;
    hp: number;
  }[];
  boss?: {
    name: string;
    x: number;
    z: number;
    hp: number;
  };
  bendahara?: {
    x: number;
    z: number;
  };
  quizQuestions?: QuizQuestion[];
}
