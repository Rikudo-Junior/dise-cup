import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RankingPeriod } from '@prisma/client';
import { RankingsService } from './rankings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Rankings')
@Controller('rankings')
export class RankingsController {
  constructor(private rankingsService: RankingsService) {}

  @Get('public-stats')
  @ApiOperation({ summary: 'Statistiques publiques pour la landing page' })
  getPublicStats() {
    return this.rankingsService.getPublicStats();
  }

  @Get()
  @ApiOperation({ summary: 'Classement général' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getGlobal(@Query('page') page = '1', @Query('limit') limit = '50') {
    return this.rankingsService.getGlobal(+limit, +page);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mon classement' })
  getMyRank(@CurrentUser() user: User) {
    return this.rankingsService.getMyRank(user.id);
  }

  @Get('promotion/:promotion')
  @ApiOperation({ summary: 'Classement par promotion' })
  getPromotion(@Param('promotion') promotion: string) {
    return this.rankingsService.getPromotion(promotion);
  }

  @Get('period')
  @ApiOperation({ summary: 'Classement hebdo ou mensuel' })
  @ApiQuery({ name: 'period', enum: RankingPeriod })
  @ApiQuery({ name: 'periodKey', example: '2026-W26' })
  getPeriod(
    @Query('period') period: RankingPeriod,
    @Query('periodKey') periodKey: string,
  ) {
    return this.rankingsService.getPeriod(period, periodKey);
  }
}
