import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // Create user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return {
      message: 'User created successfully',
      user,
    };
  }

  // Get all users
  @Get()
  async findAll(@GetUser() user) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Access Denied');
    }
    const users = await this.userService.findAll();
    return plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });
  }

  @Get('profile')
  async getProfile(@GetUser() user) {
    const userData = await this.userService.findOne(user.id);
    const data = plainToInstance(UserResponseDto, userData, {
      excludeExtraneousValues: true,
    });
    return {
      message: 'Success',
      data: {
        user: data,
      },
    };
  }

  // Get single user by ID only admin can access all users but individual can not access other users
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    if (user.id !== id && user.role !== 'admin') {
      throw new ForbiddenException('Access Denied');
    }
    const foundUser = await this.userService.findOne(id);
    return plainToInstance(UserResponseDto, foundUser, {
      excludeExtraneousValues: true,
    });
  }

  // Update user
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user,
  ) {
    if (user.id !== id && user.role !== 'admin') {
      throw new ForbiddenException('Access Denied');
    }
    await this.userService.update(id, updateUserDto);
    const updatedUser = await this.userService.findOne(id);
    return plainToInstance(UserResponseDto, updatedUser, {
      excludeExtraneousValues: true,
    });
  }

  // Delete user
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    if (user.id !== id && user.role !== 'admin') {
      throw new ForbiddenException('Access Denied');
    }
    await this.userService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
