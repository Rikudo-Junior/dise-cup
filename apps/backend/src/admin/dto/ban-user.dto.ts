import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BanUserDto {
  @ApiPropertyOptional({ example: 'Triche détectée' })
  @IsOptional()
  @IsString()
  reason?: string;
}
