import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @Expose()
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @Expose()
  email: string;

  @ApiProperty({ example: true, description: 'User active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: 'user', description: 'User role' })
  @Expose()
  role: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Account creation timestamp',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  @Expose()
  updatedAt: Date;
}
