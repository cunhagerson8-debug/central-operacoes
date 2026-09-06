import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  @Post()
  @Permissions('company.create')
  async create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Get()
@Permissions('company.view')
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '50',
  @Query('search') search = '',
) {
  return this.companiesService.findAll(
    Number(page),
    Number(limit),
    search,
  );
}

  @Get(':id')
  @Permissions('company.view')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }
  @Patch(':id')
@Permissions('company.update')
async update(
  @Param('id') id: string,
  @Body() dto: UpdateCompanyDto,
) {
  return this.companiesService.update(id, dto);
}
}