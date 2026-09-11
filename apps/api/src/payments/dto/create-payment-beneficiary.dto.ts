import { PixKeyType } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePaymentBeneficiaryDto {
  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  document?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  pixKey?: string;

  @IsOptional()
  @IsEnum(PixKeyType)
  pixKeyType?: PixKeyType;

    @IsOptional()
  @IsString()
  @MaxLength(30)
  agency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  account?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bankName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}