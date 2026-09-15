import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { DeviceAuthGuard } from './device-auth.guard';
import { CreateDeviceDto } from './dto/create-device.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { LocationDto } from './dto/location.dto';
import { CreateSmsDto } from './dto/create-sms.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('device.create')
  create(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(dto);
  }

 @Get()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('device.view')
findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '50',
  @Query('search') search = '',
) {
  return this.devicesService.findAll(
    Number(page),
    Number(limit),
    search,
  );
}

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('device.view')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('device.update')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devicesService.update(id, dto);
  }

  @Post(':id/credential')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('device.credential.manage')
  provisionCredential(@Param('id') id: string) {
    return this.devicesService.provisionCredential(id);
  }

  @Delete(':id/credential')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('device.credential.manage')
  revokeCredential(@Param('id') id: string) {
    return this.devicesService.revokeCredential(id);
  }

  @Post(':id/heartbeat')
  @UseGuards(DeviceAuthGuard)
  heartbeat(@Param('id') id: string, @Body() dto: HeartbeatDto) {
    return this.devicesService.heartbeat(id, dto);
  }

  @Post(':id/location')
  @UseGuards(DeviceAuthGuard)
  location(@Param('id') id: string, @Body() dto: LocationDto) {
    return this.devicesService.location(id, dto);
  }

  @Get(':id/locations')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('device.view')
  locations(@Param('id') id: string) {
    return this.devicesService.locations(id);
  }

  @Post(':id/sms')
  @UseGuards(DeviceAuthGuard)
  sms(@Param('id') id: string, @Body() dto: CreateSmsDto) {
    return this.devicesService.receiveSms(id, dto);
  }

  @Get(':id/sms')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('sms.view')
  smsForDevice(@Param('id') id: string) {
    return this.devicesService.findSmsForDevice(id);
  }
}
