import { IsEnum, IsInt, IsOptional, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';

export class UpdateMatchStatusDto {
  @ApiProperty({ enum: MatchStatus })
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  homeScore?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  awayScore?: number;

  @ApiPropertyOptional({ enum: ['HOME', 'AWAY'] })
  @IsOptional()
  @IsIn(['HOME', 'AWAY'])
  firstScoringTeam?: string;
}
