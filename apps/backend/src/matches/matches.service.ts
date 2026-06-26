import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class MatchesService {
  constructor(
    private prisma: PrismaService,
    private events: EventEmitter2,
  ) {}

  async findAll(tournamentId?: string, status?: MatchStatus) {
    return this.prisma.match.findMany({
      where: {
        ...(tournamentId && { tournamentId }),
        ...(status && { status }),
      },
      include: {
        tournament: { select: { name: true, logoUrl: true } },
        _count: { select: { predictions: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
        _count: { select: { predictions: true } },
      },
    });
    if (!match) throw new NotFoundException('Match introuvable');
    return match;
  }

  async findUpcoming(limit = 10) {
    return this.prisma.match.findMany({
      where: {
        status: { in: [MatchStatus.SCHEDULED, MatchStatus.LIVE] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        tournament: { select: { name: true, logoUrl: true } },
        _count: { select: { predictions: true } },
      },
      orderBy: { scheduledAt: 'asc' },
      take: limit,
    });
  }

  async create(dto: CreateMatchDto) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id: dto.tournamentId } });
    if (!tournament) throw new NotFoundException('Tournoi introuvable');
    return this.prisma.match.create({ data: { ...dto } });
  }

  async updateScore(id: string, dto: UpdateScoreDto) {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.CANCELLED) {
      throw new BadRequestException('Impossible de modifier un match annulé');
    }

    const updated = await this.prisma.match.update({
      where: { id },
      data: {
        homeScore: dto.homeScore,
        awayScore: dto.awayScore,
        status: dto.status ?? MatchStatus.FINISHED,
      },
    });

    if (updated.status === MatchStatus.FINISHED && !match.isProcessed) {
      this.events.emit('match.finished', updated);
    }

    return updated;
  }

  async updateStatus(id: string, dto: UpdateMatchStatusDto) {
    const match = await this.findOne(id);
    if (match.status === MatchStatus.CANCELLED) {
      throw new BadRequestException('Impossible de modifier un match annulé');
    }

    const data: Record<string, unknown> = { status: dto.status };
    if (dto.homeScore !== undefined) data.homeScore = dto.homeScore;
    if (dto.awayScore !== undefined) data.awayScore = dto.awayScore;
    if (dto.firstScoringTeam !== undefined) data.firstScoringTeam = dto.firstScoringTeam;

    const updated = await this.prisma.match.update({ where: { id }, data });

    if (updated.status === MatchStatus.FINISHED && !match.isProcessed) {
      this.events.emit('match.finished', updated);
    }

    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.match.delete({ where: { id } });
  }

  async createTournament(dto: CreateTournamentDto) {
    const season = await this.prisma.season.findUnique({ where: { id: dto.seasonId } });
    if (!season) throw new NotFoundException('Saison introuvable');
    return this.prisma.tournament.create({ data: { ...dto } });
  }

  async findAllTournaments() {
    return this.prisma.tournament.findMany({
      include: {
        season: { select: { name: true } },
        _count: { select: { matches: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async createSeason(name: string, description: string, startDate: string, endDate: string) {
    return this.prisma.season.create({
      data: { name, description, startDate: new Date(startDate), endDate: new Date(endDate) },
    });
  }

  async findAllSeasons() {
    return this.prisma.season.findMany({
      include: { _count: { select: { tournaments: true } } },
      orderBy: { startDate: 'desc' },
    });
  }
}
