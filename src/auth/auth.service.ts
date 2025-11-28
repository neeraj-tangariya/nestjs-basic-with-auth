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
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  // SIGNUP
  async signup(dto: SignupDto) {
    const userExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('User already exists!');
    }

    const hashedPassword = await this.hashData(dto.password);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });
    await this.userRepo.save(user);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'User Registered Successfully!',
      tokens,
    };
  }

  // SIGNIN
  async signin(dto: SigninDto) {
    const user = await this.userRepo.findOneBy({ email: dto.email });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const isPasswordMatched = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordMatched) {
      throw new BadRequestException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'User Logged In Successfully!',
      data: user,
      tokens,
    };
  }

  // hashing data
  async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  // getTokens
  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { userId, email },
        {
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRY'),
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        { userId },
        {
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY'),
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.userRepo.update(userId, { refreshToken: hash });
  }
}
