import {Type} from 'class-transformer';
import {ArrayMaxSize,ArrayMinSize,IsArray,IsInt,IsOptional,IsString,IsUUID,Length,Matches,Max,Min,ValidateNested} from 'class-validator';

export class RecipeIngredientDto{
  @IsUUID('4') materialId!:string;
  @IsString() @Matches(/^\d+(\.\d{1,6})?$/) quantity!:string;
  @IsUUID('4') unitId!:string;
}

export class RecipeVersionDto{
  @IsString() @Matches(/^\d+(\.\d{1,6})?$/) yieldQuantity!:string;
  @IsUUID('4') yieldUnitId!:string;
  @IsInt() @Min(0) @Max(10080) preparationMinutes=0;
  @IsInt() @Min(0) @Max(10080) bakingMinutes=0;
  @IsInt() @Min(0) @Max(10080) restingMinutes=0;
  @IsOptional() @IsString() @Matches(/^\d+(\.\d{1,2})?$/) bakingTemperatureC?:string;
  @IsOptional() @IsString() @Matches(/^\d+(\.\d{1,6})?$/) overheadCost='0';
  @IsOptional() @IsString() @Matches(/^\d+(\.\d{1,2})?$/) targetMarginPercent='35';
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>RecipeIngredientDto) ingredients!:RecipeIngredientDto[];
  @IsOptional() @IsArray() @ArrayMaxSize(30) @IsString({each:true}) equipment:string[]=[];
  @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({each:true}) instructions:string[]=[];
}

export class CreateRecipeDto extends RecipeVersionDto{
  @IsString() @Length(2,120) name!:string;
  @IsUUID('4') productId!:string;
}

export class CreateRecipeVersionDto extends RecipeVersionDto{}
