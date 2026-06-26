import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Match, MatchStatus, PredictionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';

const POINTS = {
  EXACT_SCORE: 10,       // score exact
  CORRECT_ISSUE: 5,      // bon vainqueur OU bonne issue nulle
  FIRST_SCORER: 3,       // bonne équipe qui marque en premier
  BONUS_STREAK: 5,       // bonus 3 scores exacts consécutifs
} as const;

@Injectable()
export class PredictionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePredictionDto) {
    const match = await this.prisma.match.findUnique({ where: { id: dto.matchId } });
    if (!match) throw new NotFoundException('Match introuvable');
    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestException('Ce match n\'est plus ouvert aux pronostics');
    }
    if (new Date() > match.predictionDeadline) {
      throw new BadRequestException('La deadline de pronostic est dépassée');
    }

    const existing = await this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId: dto.matchId } },
    });

    if (existing) {
      return this.prisma.prediction.update({
        where: { id: existing.id },
        data: {
          predictedHome: dto.predictedHome,
          predictedAway: dto.predictedAway,
          firstScorer: dto.firstScorer ?? null,
        },
        include: { match: { select: { homeTeam: true, awayTeam: true, scheduledAt: true } } },
      });
    }

    const prediction = await this.prisma.prediction.create({
      data: {
        userId,
        matchId: dto.matchId,
        predictedHome: dto.predictedHome,
        predictedAway: dto.predictedAway,
        firstScorer: dto.firstScorer ?? null,
      },
      include: { match: { select: { homeTeam: true, awayTeam: true, scheduledAt: true } } },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { totalPredictions: { increment: 1 } },
    });

    return prediction;
  }

  async findForMatch(matchId: string, userId?: string) {
    const match = await this.prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new NotFoundException('Match introuvable');

    const isFinished = match.status === MatchStatus.FINISHED;

    if (userId && !isFinished) {
      const own = await this.prisma.prediction.findUnique({
        where: { userId_matchId: { userId, matchId } },
      });
      return { own, total: await this.prisma.prediction.count({ where: { matchId } }) };
    }

    return this.prisma.prediction.findMany({
      where: { matchId },
      include: { user: { select: { username: true, avatarUrl: true, promotion: true } } },
      orderBy: { pointsEarned: 'desc' },
    });
  }

  async getMyPredictionForMatch(userId: string, matchId: string) {
    return this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
      include: { match: { select: { homeTeam: true, awayTeam: true, scheduledAt: true, status: true } } },
    });
  }

  @OnEvent('match.finished')
  async processMatchPredictions(match: Match) {
    if (match.homeScore === null || match.awayScore === null) return;
    if (match.isProcessed) return;

    const predictions = await this.prisma.prediction.findMany({
      where: { matchId: match.id, isProcessed: false },
    });

    for (const prediction of predictions) {
      const { points, type, isExact, isCorrectWinner, isCorrectFirstScorer } =
        this.calculatePoints(
          prediction.predictedHome, prediction.predictedAway,
          match.homeScore!, match.awayScore!,
          prediction.firstScorer, match.firstScoringTeam,
        );

      await this.prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          pointsEarned: points,
          predictionType: type,
          isExactScore: isExact,
          isCorrectWinner,
          isCorrectDiff: false,
          isCorrectFirstScorer,
          isProcessed: true,
        },
      });

      // Bonus 3 scores exacts consécutifs
      const bonusPoints = isExact ? await this.checkExactStreakBonus(prediction.userId) : 0;
      const totalGain = points + bonusPoints;

      await this.prisma.user.update({
        where: { id: prediction.userId },
        data: {
          totalPoints: { increment: totalGain },
          ...(isCorrectWinner && { correctPredictions: { increment: 1 } }),
          ...(isExact && { exactScorePredictions: { increment: 1 } }),
        },
      });
    }

    await this.prisma.match.update({
      where: { id: match.id },
      data: { isProcessed: true },
    });
  }

  // Retourne 5 si les 3 derniers pronostics traités de l'user sont tous exacts
  private async checkExactStreakBonus(userId: string): Promise<number> {
    const lastThree = await this.prisma.prediction.findMany({
      where: { userId, isProcessed: true },
      orderBy: { updatedAt: 'desc' },
      take: 3,
      select: { isExactScore: true },
    });
    if (lastThree.length === 3 && lastThree.every(p => p.isExactScore)) {
      return POINTS.BONUS_STREAK;
    }
    return 0;
  }

  private calculatePoints(
    predHome: number, predAway: number,
    actualHome: number, actualAway: number,
    predFirstScorer?: string | null,
    actualFirstScorer?: string | null,
  ) {
    const isExact = predHome === actualHome && predAway === actualAway;
    const predIssue = Math.sign(predHome - predAway);
    const actualIssue = Math.sign(actualHome - actualAway);
    const isCorrectIssue = predIssue === actualIssue;

    const isCorrectFirstScorer = !!(
      predFirstScorer && actualFirstScorer && predFirstScorer === actualFirstScorer
    );

    let points = 0;
    let type: PredictionType = predIssue === 0 ? PredictionType.DRAW : PredictionType.WINNER;

    if (isExact) {
      points = POINTS.EXACT_SCORE;
      type = PredictionType.SCORE_EXACT;
    } else if (isCorrectIssue) {
      points = POINTS.CORRECT_ISSUE;
    }

    if (isCorrectFirstScorer) {
      points += POINTS.FIRST_SCORER;
    }

    return { points, type, isExact, isCorrectWinner: isCorrectIssue, isCorrectFirstScorer };
  }
}
