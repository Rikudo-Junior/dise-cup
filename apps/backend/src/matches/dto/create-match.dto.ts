import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMatchDto {
  @ApiProperty()
  @IsUUID()
  tournamentId: string;

  @ApiProperty({ example: 'Côte d\'Ivoire' })
  @IsString()
  homeTeam: string;

  @ApiProperty({ example: 'Ghana' })
  @IsString()
  awayTeam: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeTeamFlag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awayTeamFlag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homeTeamCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awayTeamCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stadium?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiProperty({ example: '2026-06-25T15:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: '2026-06-25T14:45:00Z' })
  @IsDateString()
  predictionDeadline: string;
}
