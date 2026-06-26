import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'jean.dupont@ise-ensea.ci' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'jean_dupont' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'Username: lettres, chiffres et _ seulement' })
  username: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: 'ISE3' })
  @IsString()
  promotion: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
