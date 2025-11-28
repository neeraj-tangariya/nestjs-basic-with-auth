import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;

  @IsOptional()
  @IsString()
  refreshToken?: string | null;
}
