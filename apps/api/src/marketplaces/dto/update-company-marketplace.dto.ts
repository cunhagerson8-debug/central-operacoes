import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MarketplaceAccountStatus } from '@prisma/client';

export class UpdateCompanyMarketplaceDto {
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
