import {IsEmail,IsString,Length,Matches,MinLength} from 'class-validator';

export class LoginDto{
  @IsString() @Length(2,80) @Matches(/^[a-z0-9-]+$/) organizationSlug!:string;
  @IsEmail() email!:string;
  @IsString() @MinLength(8) password!:string;
}
