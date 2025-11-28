import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // Create user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return { message: 'User created successfully', user };
  }

  // Get all users
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    return users;
  }

  // Get single user by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  // Update user
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update(id, updateUserDto);
    return { message: 'User updated successfully' };
  }

  // Delete user
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
