import {Type} from 'class-transformer';
import {ArrayMaxSize,ArrayMinSize,IsArray,IsDateString,IsEnum,IsOptional,IsString,IsUUID,Length,Matches,ValidateNested} from 'class-validator';
import {PurchasePaymentType,ReceiptQualityStatus} from '@prisma/client';
const money=/^\d+(\.\d{1,6})?$/;
export class PurchaseLineDto{
  @IsUUID('4') materialId!:string;
  @IsString() @Matches(money) orderedQuantity!:string;
  @IsUUID('4') purchaseUnitId!:string;
  @IsString() @Matches(money) unitPrice!:string;
}
export class CreatePurchaseDto{
  @IsUUID('4') siteId!:string;
  @IsUUID('4') supplierId!:string;
  @IsString() @Length(2,50) reference!:string;
  @IsEnum(PurchasePaymentType) paymentType:PurchasePaymentType=PurchasePaymentType.CASH;
  @IsOptional() @IsDateString() expectedAt?:string;
  @IsString() @Matches(money) transportCost='0';
  @IsString() @Matches(money) taxCost='0';
  @IsString() @Matches(money) otherCost='0';
  @IsOptional() @IsString() @Length(0,1000) notes?:string;
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>PurchaseLineDto) lines!:PurchaseLineDto[];
}
export class ReceiptLineDto{
  @IsUUID('4') purchaseLineId!:string;
  @IsString() @Matches(money) quantity!:string;
  @IsString() @Length(1,80) lotNumber!:string;
  @IsOptional() @IsDateString() expiresAt?:string;
  @IsEnum(ReceiptQualityStatus) qualityStatus:ReceiptQualityStatus=ReceiptQualityStatus.ACCEPTED;
}
export class ReceivePurchaseDto{
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>ReceiptLineDto) lines!:ReceiptLineDto[];
}
