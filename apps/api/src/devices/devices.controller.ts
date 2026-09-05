import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { CreateDeviceDto } from './dto/create-device.dto';
import { HeartbeatDto } from './dto/heartbeat.dto';
import { LocationDto } from './dto/location.dto';
import { CreateSmsDto } from './dto/create-sms.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@Controller('devices')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @Permissions('device.create')
  create(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(dto);
  }

  @Get()
  @Permissions('device.view')
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  @Permissions('device.view')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @Permissions('device.update')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devicesService.update(id, dto);
  }

  @Post(':id/heartbeat')
  @Permissions('device.update')
  heartbeat(@Param('id') id: string, @Body() dto: HeartbeatDto) {
    return this.devicesService.heartbeat(id, dto);
  }

  @Post(':id/location')
  @Permissions('device.update')
  location(@Param('id') id: string, @Body() dto: LocationDto) {
    return this.devicesService.location(id, dto);
  }

  @Get(':id/locations')
  @Permissions('device.view')
  locations(@Param('id') id: string) {
    return this.devicesService.locations(id);
  }

  @Post(':id/sms')
  @Permissions('sms.receive')
  sms(@Param('id') id: string, @Body() dto: CreateSmsDto) {
    return this.devicesService.receiveSms(id, dto);
  }

  @Get(':id/sms')
  @Permissions('sms.view')
  smsForDevice(@Param('id') id: string) {
    return this.devicesService.findSmsForDevice(id);
  }
}
