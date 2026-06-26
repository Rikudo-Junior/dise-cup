import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        promotion: true,
        avatarUrl: true,
        role: true,
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        exactScorePredictions: true,
        currentStreak: true,
        bestStreak: true,
        lastActiveAt: true,
        createdAt: true,
        userBadges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const conflict = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id } },
      });
      if (conflict) throw new ConflictException('Username déjà utilisé');
    }
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        promotion: true,
        avatarUrl: true,
        role: true,
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        exactScorePredictions: true,
        currentStreak: true,
        bestStreak: true,
      },
    });
  }

  async getStats(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        totalPoints: true,
        totalPredictions: true,
        correctPredictions: true,
        exactScorePredictions: true,
        currentStreak: true,
        bestStreak: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    const successRate = user.totalPredictions > 0
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
      : 0;
    return { ...user, successRate };
  }

  async getUserPredictions(id: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [predictions, total] = await Promise.all([
      this.prisma.prediction.findMany({
        where: { userId: id },
        include: {
          match: {
            select: {
              homeTeam: true,
              awayTeam: true,
              homeTeamFlag: true,
              awayTeamFlag: true,
              scheduledAt: true,
              status: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.prediction.count({ where: { userId: id } }),
    ]);
    return { predictions, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
