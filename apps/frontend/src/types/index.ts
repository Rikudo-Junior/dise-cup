export type UserRole = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  promotion: string;
  avatarUrl?: string;
  role: UserRole;
  totalPoints: number;
  totalPredictions: number;
  correctPredictions: number;
  exactScorePredictions: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamFlag?: string;
  awayTeamFlag?: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
  stadium?: string;
  city?: string;
  stage?: string;
  scheduledAt: string;
  predictionDeadline: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  tournament: { name: string; logoUrl?: string };
  _count?: { predictions: number };
}

export interface Prediction {
  id: string;
  matchId: string;
  predictedHome: number;
  predictedAway: number;
  firstScorer?: 'HOME' | 'AWAY' | null;
  pointsEarned: number;
  isExactScore: boolean;
  isCorrectWinner: boolean;
  isCorrectFirstScorer?: boolean;
  isProcessed?: boolean;
  match?: Partial<Match>;
}

export interface RankingEntry {
  rank: number;
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  promotion: string;
  avatarUrl?: string;
  totalPoints: number;
  totalPredictions: number;
  correctPredictions: number;
  successRate: number;
  currentStreak?: number;
}

export interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  emoji: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
