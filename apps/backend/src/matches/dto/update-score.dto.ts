import { IsInt, Min, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';

export class UpdateScoreDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  homeScore: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  awayScore: number;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;
}
