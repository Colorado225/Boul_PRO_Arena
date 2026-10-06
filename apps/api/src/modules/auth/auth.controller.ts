import {Body,Controller,Get,HttpCode,Post,Req,Res,UseGuards} from '@nestjs/common';
import {Throttle} from '@nestjs/throttler';
import type {Request,Response} from 'express';
import {AuthService} from './auth.service.js';
import {AuthGuard} from './auth.guard.js';
import {SESSION_COOKIE,SESSION_DURATION_MS} from './auth.constants.js';
import {LoginDto} from './dto/login.dto.js';
import {RequestPasswordResetDto} from './dto/request-password-reset.dto.js';
import {ResetPasswordDto} from './dto/reset-password.dto.js';
import {AcceptInvitationDto} from './dto/accept-invitation.dto.js';

@Controller('auth')
export class AuthController{
  constructor(private readonly auth:AuthService){}

  @Post('login') @HttpCode(200) @Throttle({default:{limit:5,ttl:60_000}})
  async login(@Body() body:LoginDto,@Req() req:Request,@Res({passthrough:true}) res:Response){
    const result=await this.auth.login(body,{ip:req.ip,userAgent:req.get('user-agent')});
    res.cookie(SESSION_COOKIE,result.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:SESSION_DURATION_MS});
    return {user:result.principal,expiresAt:result.expiresAt};
  }

  @Get('me') @UseGuards(AuthGuard)
  me(@Req() req:Request){return {user:req.auth}}

  @Post('logout') @HttpCode(204)
  async logout(@Req() req:Request,@Res({passthrough:true}) res:Response){
    await this.auth.logout(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE,{path:'/'});
  }

  @Post('accept-invitation') @HttpCode(201) @Throttle({default:{limit:5,ttl:60_000}})
  acceptInvitation(@Body() body:AcceptInvitationDto){return this.auth.acceptInvitation(body)}

  @Post('request-password-reset') @HttpCode(202) @Throttle({default:{limit:3,ttl:60_000}})
  requestReset(@Body() body:RequestPasswordResetDto){return this.auth.requestPasswordReset(body)}

  @Post('reset-password') @HttpCode(200) @Throttle({default:{limit:5,ttl:60_000}})
  resetPassword(@Body() body:ResetPasswordDto){return this.auth.resetPassword(body)}
}
