import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../auth/entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;
}
