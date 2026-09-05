import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Permissions } from '../auth/permissions.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('user.view')
  async findAll() {
    return this.usersService.findAll();
  }
}