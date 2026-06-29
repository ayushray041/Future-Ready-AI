// types/roadmap.ts
// Responsibility: Types for the career roadmap and milestone stages.

export type StageStatus = 'completed' | 'current' | 'upcoming';

export interface RoadmapItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface RoadmapStage {
  id: string;
  year: string;
  title: string;
  status: StageStatus;
  items: RoadmapItem[];
}

export interface Roadmap {
  userId: string;
  stages: RoadmapStage[];
  updatedAt: string;
}
