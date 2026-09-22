export interface Party {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  color: string;
  badgeBg: string;
  textColor: string;
  customImage: string | null;
  isLocked: boolean;
  leader?: string;
  foundedYear?: number;
  description?: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  parties: Record<string, number>;
}
