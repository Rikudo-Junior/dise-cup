import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MatchStatus, UserRole } from '@prisma/client';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des matchs' })
  @ApiQuery({ name: 'tournamentId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: MatchStatus })
  findAll(
    @Query('tournamentId') tournamentId?: string,
    @Query('status') status?: MatchStatus,
  ) {
    return this.matchesService.findAll(tournamentId, status);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Prochains matchs' })
  findUpcoming(@Query('limit') limit = 10) {
    return this.matchesService.findUpcoming(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un match' })
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Créer un match' })
  create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch(':id/score')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Mettre à jour le score' })
  updateScore(@Param('id') id: string, @Body() dto: UpdateScoreDto) {
    return this.matchesService.updateScore(id, dto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Changer le statut d\'un match' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateMatchStatusDto) {
    return this.matchesService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Supprimer un match' })
  delete(@Param('id') id: string) {
    return this.matchesService.delete(id);
  }
}

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private matchesService: MatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des tournois' })
  findAll() {
    return this.matchesService.findAllTournaments();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Créer un tournoi' })
  create(@Body() dto: CreateTournamentDto) {
    return this.matchesService.createTournament(dto);
  }
}
