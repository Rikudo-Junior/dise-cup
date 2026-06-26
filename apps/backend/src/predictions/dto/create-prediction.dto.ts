import { IsUUID, IsInt, Min, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePredictionDto {
  @ApiProperty()
  @IsUUID()
  matchId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  predictedHome: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  predictedAway: number;

  @ApiPropertyOptional({ enum: ['HOME', 'AWAY'], description: 'Équipe qui marque en premier' })
  @IsOptional()
  @IsIn(['HOME', 'AWAY'])
  firstScorer?: string;
}
