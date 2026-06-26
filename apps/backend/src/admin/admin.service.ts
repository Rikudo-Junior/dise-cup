import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, predictions, matches, activeMatches] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.prediction.count(),
      this.prisma.match.count(),
      this.prisma.match.count({ where: { status: 'LIVE' } }),
    ]);
    return { users, predictions, matches, activeMatches };
  }

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          promotion: true,
          role: true,
          isBanned: true,
          banReason: true,
          totalPoints: true,
          totalPredictions: true,
          createdAt: true,
          lastActiveAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async banUser(adminId: string, userId: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, banReason: reason },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: AuditAction.USER_BANNED,
        target: userId,
        metadata: { reason },
      },
    });

    return updated;
  }

  async unbanUser(adminId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false, banReason: null },
    });

    await this.prisma.auditLog.create({
      data: { actorId: adminId, action: AuditAction.USER_UNBANNED, target: userId },
    });

    return updated;
  }

  async changeRole(userId: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });
  }

  async recalculateScores(adminId: string) {
    await this.prisma.user.updateMany({
      data: { totalPoints: 0, correctPredictions: 0, exactScorePredictions: 0 },
    });

    const predictions = await this.prisma.prediction.findMany({
      where: { isProcessed: true },
      select: { userId: true, pointsEarned: true, isCorrectWinner: true, isExactScore: true },
    });

    const userStats = new Map<string, { points: number; correct: number; exact: number }>();
    for (const p of predictions) {
      const s = userStats.get(p.userId) || { points: 0, correct: 0, exact: 0 };
      s.points += p.pointsEarned;
      if (p.isCorrectWinner) s.correct++;
      if (p.isExactScore) s.exact++;
      userStats.set(p.userId, s);
    }

    for (const [userId, stats] of userStats) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: stats.points,
          correctPredictions: stats.correct,
          exactScorePredictions: stats.exact,
        },
      });
    }

    await this.prisma.auditLog.create({
      data: { actorId: adminId, action: AuditAction.SCORES_RECALCULATED },
    });

    return { recalculated: userStats.size };
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        include: { actor: { select: { username: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);
    return { logs, total, page, pages: Math.ceil(total / limit) };
  }
}
