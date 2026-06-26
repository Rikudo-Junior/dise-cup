import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { AdminService } from './admin.service';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '[Admin] Statistiques globales' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: '[Admin] Liste des utilisateurs' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: '[Admin] Bannir un utilisateur' })
  banUser(
    @CurrentUser() admin: User,
    @Param('id') id: string,
    @Body() dto: BanUserDto,
  ) {
    return this.adminService.banUser(admin.id, id, dto.reason);
  }

  @Patch('users/:id/unban')
  @ApiOperation({ summary: '[Admin] Débannir un utilisateur' })
  unbanUser(@CurrentUser() admin: User, @Param('id') id: string) {
    return this.adminService.unbanUser(admin.id, id);
  }

  @Patch('users/:id/role')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Changer le rôle d\'un utilisateur' })
  changeRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.changeRole(id, role);
  }

  @Post('recalculate-scores')
  @ApiOperation({ summary: '[Admin] Recalculer tous les scores' })
  recalculate(@CurrentUser() admin: User) {
    return this.adminService.recalculateScores(admin.id);
  }

  @Get('audit-logs')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: '[SuperAdmin] Journal d\'audit' })
  getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getAuditLogs(page, limit);
  }
}
