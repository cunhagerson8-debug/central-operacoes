import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateHolderDto } from './dto/create-holder.dto';
import { HoldersService } from './holders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('holders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HoldersController {
  constructor(
    private readonly holdersService: HoldersService,
  ) {}

  @Post()
  @Permissions('holder.create')
  async create(@Body() dto: CreateHolderDto) {
    return this.holdersService.create(dto);
  }

  @Get()
  @Permissions('holder.view')
  async findAll() {
    return this.holdersService.findAll();
  }

  @Get(':id')
  @Permissions('holder.view')
  async findOne(@Param('id') id: string) {
    return this.holdersService.findOne(id);
  }
}