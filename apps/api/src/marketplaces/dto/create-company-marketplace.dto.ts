import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MarketplaceAccountStatus } from '@prisma/client';

export class CreateCompanyMarketplaceDto {
  @IsUUID()
  marketplaceId!: string;

  @IsOptional()
  @IsEnum(MarketplaceAccountStatus)
  status?: MarketplaceAccountStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  lastCheckedAt?: string;
}
