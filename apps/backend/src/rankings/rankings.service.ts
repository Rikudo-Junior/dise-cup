import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RankingPeriod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getWeek, getMonth, getYear } from 'date-fns';

@Injectable()
export class RankingsService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats() {
    const [participants, leader, totalPredictions] = await Promise.all([
      this.prisma.user.count({ where: { isBanned: false } }),
      this.prisma.user.findFirst({
        where: { isBanned: false },
        orderBy: { totalPoints: 'desc' },
        select: { username: true, totalPoints: true },
      }),
      this.prisma.prediction.count(),
    ]);
    return { participants, totalPredictions, leader };
  }

  async getGlobal(limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const users = await this.prisma.user.findMany({
      where: { isBanned: false },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        promotion: true,
        avatarUrl: true,
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        exactScorePredictions: true,
        currentStreak: true,
      },
      orderBy: [{ totalPoints: 'desc' }, { correctPredictions: 'desc' }],
      skip,
      take: limit,
    });

    return users.map((u, i) => ({
      rank: skip + i + 1,
      ...u,
      successRate: u.totalPredictions > 0
        ? Math.round((u.correctPredictions / u.totalPredictions) * 100)
        : 0,
    }));
  }

  async getPeriod(period: RankingPeriod, periodKey: string, limit = 50) {
    return this.prisma.ranking.findMany({
      where: { period, periodKey },
      include: {
        user: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            promotion: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { rank: 'asc' },
      take: limit,
    });
  }

  async getMyRank(userId: string) {
    const allUsers = await this.prisma.user.findMany({
      where: { isBanned: false },
      select: { id: true, totalPoints: true },
      orderBy: { totalPoints: 'desc' },
    });
    const rank = allUsers.findIndex((u) => u.id === userId) + 1;
    return { rank: rank || null, total: allUsers.length };
  }

  async getPromotion(promotion: string, limit = 50) {
    const users = await this.prisma.user.findMany({
      where: { promotion, isBanned: false },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        promotion: true,
        avatarUrl: true,
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        currentStreak: true,
      },
      orderBy: { totalPoints: 'desc' },
      take: limit,
    });
    return users.map((u, i) => ({
      rank: i + 1,
      ...u,
      successRate: u.totalPredictions > 0
        ? Math.round((u.correctPredictions / u.totalPredictions) * 100)
        : 0,
    }));
  }

  @Cron(CronExpression.EVERY_HOUR)
  async computeWeeklyRanking() {
    const now = new Date();
    const week = getWeek(now);
    const year = getYear(now);
    const periodKey = `${year}-W${String(week).padStart(2, '0')}`;
    await this.computePeriodRanking(RankingPeriod.WEEKLY, periodKey);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async computeMonthlyRanking() {
    const now = new Date();
    const month = getMonth(now) + 1;
    const year = getYear(now);
    const periodKey = `${year}-M${String(month).padStart(2, '0')}`;
    await this.computePeriodRanking(RankingPeriod.MONTHLY, periodKey);
  }

  private async computePeriodRanking(period: RankingPeriod, periodKey: string) {
    const users = await this.prisma.user.findMany({
      where: { isBanned: false, totalPredictions: { gt: 0 } },
      select: {
        id: true,
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        exactScorePredictions: true,
      },
      orderBy: { totalPoints: 'desc' },
    });

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      await this.prisma.ranking.upsert({
        where: { userId_period_periodKey: { userId: u.id, period, periodKey } },
        update: {
          rank: i + 1,
          points: u.totalPoints,
          predictions: u.totalPredictions,
          correctPredictions: u.correctPredictions,
          exactScores: u.exactScorePredictions,
          successRate: u.totalPredictions > 0
            ? u.correctPredictions / u.totalPredictions
            : 0,
        },
        create: {
          userId: u.id,
          period,
          periodKey,
          rank: i + 1,
          points: u.totalPoints,
          predictions: u.totalPredictions,
          correctPredictions: u.correctPredictions,
          exactScores: u.exactScorePredictions,
          successRate: u.totalPredictions > 0
            ? u.correctPredictions / u.totalPredictions
            : 0,
        },
      });
    }
  }
}
