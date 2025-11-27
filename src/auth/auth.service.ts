import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // SIGNUP
  async signup(dto: SignupDto) {
    const userExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (userExists) throw new BadRequestException('Email already exists');

    const hashedPass = await bcrypt.hash(dto.password, 10);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPass,
    });

    await this.userRepo.save(user);

    return { message: 'User registered successfully' };
  }

  // SIGNIN
  async signin(dto: SigninDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user) throw new BadRequestException('Invalid credentials');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    const token = this.jwtService.sign({ id: user.id, email: user.email });

    return { message: 'Login successful', token };
  }

  // VIEW USER
  async getUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // UPDATE USER
  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.getUser(id);

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepo.update(id, dto);

    return { message: 'User updated successfully' };
  }

  // DELETE USER
  async deleteUser(id: number) {
    const user = await this.getUser(id);

    await this.userRepo.remove(user);

    return { message: 'User deleted successfully' };
  }
}
