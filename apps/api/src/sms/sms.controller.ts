import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { SmsService } from './sms.service';

@Controller('sms')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get()
  @Permissions('sms.view')
  findAll(
    @Query('companyId') companyId?: string,
    @Query('deviceId') deviceId?: string,
    @Query('driverId') driverId?: string,
    @Query('read') read?: string,
    @Query('search') search?: string,
  ) {
    return this.smsService.findAll({ companyId, deviceId, driverId, read, search });
  }

  @Patch(':id/read')
  @Permissions('sms.update')
  markAsRead(@Param('id') id: string) {
    return this.smsService.markAsRead(id);
  }
}
