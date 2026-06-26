import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Badges')
@Controller('badges')
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Tous les badges disponibles' })
  findAll() {
    return this.badgesService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mes badges gagnés' })
  getMyBadges(@CurrentUser() user: User) {
    return this.badgesService.getUserBadges(user.id);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Badges d\'un utilisateur' })
  getUserBadges(@Param('id') id: string) {
    return this.badgesService.getUserBadges(id);
  }
}
