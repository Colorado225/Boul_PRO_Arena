import {IsOptional,IsString,IsUUID,Matches} from 'class-validator';

export class CreateConversionDto{
  @IsUUID('4') fromUnitId!:string;
  @IsUUID('4') toUnitId!:string;
  @IsString() @Matches(/^\d+(\.\d{1,9})?$/) factor!:string;
  @IsOptional() @IsUUID('4') materialId?:string;
}
