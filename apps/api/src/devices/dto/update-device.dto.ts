import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { ConnectionType, DeviceStatus } from '@prisma/client';

export class UpdateDeviceDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(3, 80)
  imei?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  model?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  androidVersion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  simCarrier?: string;

  @IsOptional()
  @IsEnum(ConnectionType)
  connectionType?: ConnectionType;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
