import {IsOptional,IsString,IsUUID,Length,Matches} from 'class-validator';

export class CreateMaterialDto{
  @IsString() @Length(2,40) @Matches(/^[A-Z0-9_-]+$/) sku!:string;
  @IsString() @Length(2,120) name!:string;
  @IsOptional() @IsUUID('4') categoryId?:string;
  @IsUUID('4') baseUnitId!:string;
  @IsOptional() @IsUUID('4') purchaseUnitId?:string;
  @IsOptional() @IsString() @Matches(/^\d+(\.\d{1,6})?$/) initialQuantity='0';
  @IsOptional() @IsString() @Matches(/^\d+(\.\d{1,6})?$/) minimumStock='0';
}
