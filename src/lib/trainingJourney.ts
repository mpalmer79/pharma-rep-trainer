export type JourneyStatus = "locked" | "available" | "in_progress" | "completed";

export type JourneyNodeType =
  | "onboarding"
  | "persona"
  | "objection"
  | "skill"
  | "assessment";

export interface TrainingJourneyNode {
  id: string;
  title: string;
  description: string;
  type: JourneyNodeType;

  status: JourneyStatus;

  requiredToUnlock?: string[];
  estimatedMinutes?: number;

  recommended?: boolean;

  metadata?: {
    personaId?: string;
    objectionId?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
  };
}

export interface TrainingJourney {
  id: string;
  title: string;
  description: string;

  nodes: TrainingJourneyNode[];
}
