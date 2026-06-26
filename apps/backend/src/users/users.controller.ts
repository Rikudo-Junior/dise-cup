import { Controller, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mon profil complet avec badges' })
  getMe(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour mon profil' })
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Mes statistiques de pronostics' })
  getMyStats(@CurrentUser() user: User) {
    return this.usersService.getStats(user.id);
  }

  @Get('me/predictions')
  @ApiOperation({ summary: 'Historique de mes pronostics' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyPredictions(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.getUserPredictions(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Profil public d\'un utilisateur' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
