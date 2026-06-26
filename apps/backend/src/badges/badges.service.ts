import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { BadgeType, Match } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.badge.findMany({ orderBy: { type: 'asc' } });
  }

  async getUserBadges(userId: string) {
    return this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });
  }

  @OnEvent('match.finished')
  async checkBadgesAfterMatch(match: Match) {
    const predictions = await this.prisma.prediction.findMany({
      where: { matchId: match.id, isProcessed: true },
      select: { userId: true, isExactScore: true, isCorrectWinner: true },
    });

    for (const p of predictions) {
      await this.checkAndAwardBadges(p.userId);
    }
  }

  async checkAndAwardBadges(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPredictions: true,
        exactScorePredictions: true,
        correctPredictions: true,
        currentStreak: true,
        totalPoints: true,
      },
    });
    if (!user) return;

    const checks: { type: BadgeType; condition: boolean }[] = [
      { type: BadgeType.FIRST_PREDICTION, condition: user.totalPredictions >= 1 },
      { type: BadgeType.EXACT_SCORE_KING, condition: user.exactScorePredictions >= 5 },
      { type: BadgeType.WIN_STREAK, condition: user.currentStreak >= 5 },
      { type: BadgeType.CENTURION, condition: user.totalPredictions >= 100 },
      { type: BadgeType.CHAMPION, condition: user.totalPoints >= 500 },
    ];

    for (const check of checks) {
      if (!check.condition) continue;
      const badge = await this.prisma.badge.findUnique({ where: { type: check.type } });
      if (!badge) continue;
      const already = await this.prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId, badgeId: badge.id } },
      });
      if (!already) {
        await this.prisma.userBadge.create({ data: { userId, badgeId: badge.id } });
      }
    }
  }
}
