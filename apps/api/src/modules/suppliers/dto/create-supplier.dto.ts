import {IsEmail,IsInt,IsOptional,IsString,Length,Matches,Max,Min} from 'class-validator';

export class CreateSupplierDto{
  @IsString() @Matches(/^[A-Za-z0-9_-]{2,30}$/) code!:string;
  @IsString() @Length(2,140) name!:string;
  @IsOptional() @IsString() @Length(2,120) contactName?:string;
  @IsOptional() @IsString() @Length(8,30) phone?:string;
  @IsOptional() @IsEmail() email?:string;
  @IsOptional() @IsString() @Length(2,240) address?:string;
  @IsInt() @Min(0) @Max(365) paymentTermsDays=0;
  @IsInt() @Min(0) @Max(365) leadTimeDays=0;
  @IsOptional() @IsString() @Length(0,1000) notes?:string;
}
