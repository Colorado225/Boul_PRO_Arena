import {IsEmail,IsString,Length,Matches} from 'class-validator';

export class RequestPasswordResetDto{
  @IsString() @Length(2,80) @Matches(/^[a-z0-9-]+$/) organizationSlug!:string;
  @IsEmail() email!:string;
}
