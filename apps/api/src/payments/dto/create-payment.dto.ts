import {
  PaymentCategory,
  PaymentStatus,
} from '@prisma/client';

import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  beneficiaryId!: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsEnum(PaymentCategory)
  category!: PaymentCategory;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  dueDay?: number;

  @IsInt()
  @Min(1)
  @Max(12)
  referenceMonth!: number;

  @IsInt()
  @Min(2000)
  referenceYear!: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}