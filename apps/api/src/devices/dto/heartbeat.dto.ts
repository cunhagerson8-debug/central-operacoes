import { IsBoolean, IsDateString, IsEnum, IsInt, Max, Min } from 'class-validator';
import { ConnectionType } from '@prisma/client';

export class HeartbeatDto {
  @IsInt()
  @Min(0)
  @Max(100)
  batteryLevel!: number;

  @IsBoolean()
  isCharging!: boolean;

  @IsBoolean()
  online!: boolean;

  @IsEnum(ConnectionType)
  connectionType!: ConnectionType;

  @IsDateString()
  timestamp!: string;
}
