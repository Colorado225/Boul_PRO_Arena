import {IsInt,IsString,Length,Matches,Min} from 'class-validator';
export class CreateProductDto{@IsString() @Length(2,40) @Matches(/^[A-Z0-9_-]+$/) sku!:string;@IsString() @Length(2,120) name!:string;@IsInt() @Min(0) salePrice!:number}
