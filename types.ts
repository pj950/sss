

export interface Criterion {
  id: string;
  name: string;
  max_score: number;
}

export interface Team {
  id: string;
  name: string;
}

export interface Judge {
  id: string;
  name: string;
  secret_id: string;
}

export interface Rating {
  judge_id: string;
  team_id: string;
  scores: Record<string, number>; // { [criterionId]: score }
}

export interface AppState {
  teams: Team[];
  judges: Judge[];
  criteria: Criterion[];
  ratings: Rating[];
  activeTeamId: string | null;
  isSetupLocked: boolean;
}
