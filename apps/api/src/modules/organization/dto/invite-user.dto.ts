import {Role} from '@prisma/client';
import {ArrayUnique,IsArray,IsEmail,IsEnum,IsOptional,IsString,IsUUID,Length} from 'class-validator';

export class InviteUserDto{
  @IsString() @Length(2,120) name!:string;
  @IsEmail() email!:string;
  @IsEnum(Role) role!:Role;
  @IsOptional() @IsArray() @ArrayUnique() @IsUUID('4',{each:true}) siteIds:string[]=[];
}
