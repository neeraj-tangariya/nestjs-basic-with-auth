import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { OtpVerifyDto } from './dto/otpverify.dto';
import { OTP_EXPIRY_MINUTES } from './auth.constants';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // SIGNUP
  async signup(dto: SignupDto) {
    const userExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('User already exists!');
    }

    // Generate OTP
    const otp = this.generateOtp();
    const otpHash = await this.hashData(otp);
    const otpExpiresAt = this.getOtpExpiryTime();

    const hashedPassword = await this.hashData(dto.password);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      mfaOtpHash: otpHash,
      mfaOtpExpiresAt: otpExpiresAt,
      mfaEmailVerified: false,
    });
    await this.userRepo.save(user);

    // Send OTP via email
    await this.emailService.sendOtpEmail(user.email, otp, user.firstName);

    return {
      message:
        'User registered successfully! Please check your email for the OTP to verify your account.',
      data: {
        email: user.email,
      },
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
      throw new BadRequestException('Invalid credentials');
    }

    // Check if email is verified
    if (user.mfaEmailVerified) {
      // Email verified - proceed with normal login
      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return {
        message: 'User logged in successfully!',
        data: { user, tokens },
      };
    } else {
      // Email not verified - send OTP
      const otp = this.generateOtp();
      const otpHash = await this.hashData(otp);
      const otpExpiresAt = this.getOtpExpiryTime();

      await this.userRepo.update(user.id, {
        mfaOtpHash: otpHash,
        mfaOtpExpiresAt: otpExpiresAt,
      });

      // Send OTP via email
      await this.emailService.sendOtpEmail(user.email, otp, user.firstName);

      return {
        message: 'Email not verified. OTP has been sent to your email.',
        data: {
          email: user.email,
        },
      };
    }
  }

  // OTP VERIFY
  async otpVerify(dto: OtpVerifyDto) {
    const user = await this.userRepo.findOneBy({ email: dto.email });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (!user.mfaOtpHash || !user.mfaOtpExpiresAt) {
      throw new BadRequestException('No OTP found. Please request a new one.');
    }

    // Check if OTP is expired
    if (new Date() > user.mfaOtpExpiresAt) {
      throw new UnauthorizedException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(dto.otp, user.mfaOtpHash);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark email as verified and clear OTP
    await this.userRepo.update(user.id, {
      mfaEmailVerified: true,
      mfaOtpHash: undefined,
      mfaOtpExpiresAt: undefined,
    });

    // Generate tokens
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Email verified successfully! You are now logged in.',
      data: { user, tokens },
    };
  }

  // RESEND OTP
  async resendOtp(email: string) {
    const user = await this.userRepo.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (user.mfaEmailVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    // Generate new OTP
    const otp = this.generateOtp();
    const otpHash = await this.hashData(otp);
    const otpExpiresAt = this.getOtpExpiryTime();

    await this.userRepo.update(user.id, {
      mfaOtpHash: otpHash,
      mfaOtpExpiresAt: otpExpiresAt,
    });

    // Send OTP via email
    await this.emailService.sendOtpEmail(user.email, otp, user.firstName);

    return {
      message: 'OTP has been sent to your email successfully!',
      data: {
        email: user.email,
      },
    };
  }

  // HELPER: Generate random 6-digit OTP
  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // HELPER: Get OTP expiry time
  getOtpExpiryTime(): Date {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + OTP_EXPIRY_MINUTES);
    return expiryTime;
  }

  // HELPER: Hash data
  async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  // HELPER: Update refresh token
  async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.userRepo.update(userId, { refreshToken: hash });
  }

  // HELPER: Generate JWT tokens
  async getTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, email, role },
        {
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRY'),
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        },
      ),
      this.jwtService.signAsync(
        { id: userId, email, role },
        {
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRY'),
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
