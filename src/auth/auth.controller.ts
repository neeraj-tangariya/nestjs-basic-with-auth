import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { OtpVerifyDto } from './dto/otpverify.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Public()
  @Post('otp-verify')
  @ApiOperation({ summary: 'Verify OTP and complete email verification' })
  @ApiResponse({
    status: 200,
    description: 'OTP successfully verified, user logged in',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  otpVerify(@Body() dto: OtpVerifyDto) {
    return this.authService.otpVerify(dto);
  }

  @Public()
  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to user email' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  @ApiResponse({ status: 404, description: 'User not found' })
  resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto.email);
  }
}
