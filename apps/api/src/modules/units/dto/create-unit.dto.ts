import {UnitDimension} from '@prisma/client';
import {IsEnum,IsInt,IsString,Length,Matches,Max,Min} from 'class-validator';

export class CreateUnitDto{
  @IsString() @Length(1,20) @Matches(/^[A-Z0-9_-]+$/) code!:string;
  @IsString() @Length(1,80) name!:string;
  @IsString() @Length(1,12) symbol!:string;
  @IsEnum(UnitDimension) dimension!:UnitDimension;
  @IsInt() @Min(0) @Max(9) decimalPlaces=3;
}
