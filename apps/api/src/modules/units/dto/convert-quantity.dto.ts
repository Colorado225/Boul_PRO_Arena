import {IsOptional,IsString,IsUUID,Matches} from 'class-validator';

export class ConvertQuantityDto{
  @IsString() @Matches(/^\d+(\.\d+)?$/) quantity!:string;
  @IsUUID('4') fromUnitId!:string;
  @IsUUID('4') toUnitId!:string;
  @IsOptional() @IsUUID('4') materialId?:string;
}
