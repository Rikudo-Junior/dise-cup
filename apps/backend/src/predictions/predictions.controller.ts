import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Predictions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('predictions')
export class PredictionsController {
  constructor(private predictionsService: PredictionsService) {}

  @Post()
  @ApiOperation({ summary: 'Soumettre ou modifier un pronostic' })
  create(@CurrentUser() user: User, @Body() dto: CreatePredictionDto) {
    return this.predictionsService.create(user.id, dto);
  }

  @Get('match/:matchId')
  @ApiOperation({ summary: 'Pronostics pour un match (révélés après résultat)' })
  findForMatch(@Param('matchId') matchId: string, @CurrentUser() user: User) {
    return this.predictionsService.findForMatch(matchId, user.id);
  }

  @Get('match/:matchId/mine')
  @ApiOperation({ summary: 'Mon pronostic pour un match' })
  getMyPrediction(@CurrentUser() user: User, @Param('matchId') matchId: string) {
    return this.predictionsService.getMyPredictionForMatch(user.id, matchId);
  }
}
