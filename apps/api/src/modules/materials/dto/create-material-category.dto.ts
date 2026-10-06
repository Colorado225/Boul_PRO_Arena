import {IsString,Length} from 'class-validator';
export class CreateMaterialCategoryDto{@IsString() @Length(2,80) name!:string}
