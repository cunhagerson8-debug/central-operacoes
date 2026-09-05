import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';
import { CreateCompanyMarketplaceDto } from './dto/create-company-marketplace.dto';
import { UpdateCompanyMarketplaceDto } from './dto/update-company-marketplace.dto';
import { MarketplacesService } from './marketplaces.service';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MarketplacesController {
  constructor(private readonly service: MarketplacesService) {}

  @Get('marketplaces')
  @Permissions('marketplace.view')
  findAll() {
    return this.service.findAll();
  }

  @Post('companies/:companyId/marketplaces')
  @Permissions('marketplace.create')
  create(@Param('companyId') companyId: string, @Body() dto: CreateCompanyMarketplaceDto) {
    return this.service.createAccount(companyId, dto);
  }

  @Get('companies/:companyId/marketplaces')
  @Permissions('marketplace.view')
  findCompanyAccounts(@Param('companyId') companyId: string) {
    return this.service.findCompanyAccounts(companyId);
  }

  @Patch('companies/:companyId/marketplaces/:accountId')
  @Permissions('marketplace.update')
  update(
    @Param('companyId') companyId: string,
    @Param('accountId') accountId: string,
    @Body() dto: UpdateCompanyMarketplaceDto,
  ) {
    return this.service.updateAccount(companyId, accountId, dto);
  }
}
