import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyMarketplaceDto } from './dto/create-company-marketplace.dto';
import { UpdateCompanyMarketplaceDto } from './dto/update-company-marketplace.dto';

@Injectable()
export class MarketplacesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.marketplace.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async createAccount(companyId: string, dto: CreateCompanyMarketplaceDto) {
    await this.ensureCompany(companyId);
    await this.ensureMarketplace(dto.marketplaceId);

    return this.prisma.companyMarketplaceAccount.create({
      data: {
        companyId,
        marketplaceId: dto.marketplaceId,
        status: dto.status,
        notes: dto.notes,
        lastCheckedAt: dto.lastCheckedAt ? new Date(dto.lastCheckedAt) : undefined,
      },
      include: { marketplace: true, company: { select: { id: true, name: true } } },
    });
  }

  async findCompanyAccounts(companyId: string) {
    await this.ensureCompany(companyId);

    return this.prisma.companyMarketplaceAccount.findMany({
      where: { companyId },
      include: { marketplace: true, company: { select: { id: true, name: true } } },
      orderBy: { marketplace: { name: 'asc' } },
    });
  }

  async updateAccount(companyId: string, accountId: string, dto: UpdateCompanyMarketplaceDto) {
    const account = await this.prisma.companyMarketplaceAccount.findFirst({
      where: { id: accountId, companyId },
    });

    if (!account) {
      throw new NotFoundException('Conta de marketplace não encontrada.');
    }

    return this.prisma.companyMarketplaceAccount.update({
      where: { id: accountId },
      data: {
        status: dto.status,
        notes: dto.notes,
        lastCheckedAt: dto.lastCheckedAt ? new Date(dto.lastCheckedAt) : undefined,
      },
      include: { marketplace: true, company: { select: { id: true, name: true } } },
    });
  }

  private async ensureCompany(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!company) throw new NotFoundException('Empresa não encontrada.');
  }

  private async ensureMarketplace(id: string) {
    const marketplace = await this.prisma.marketplace.findUnique({ where: { id }, select: { id: true, active: true } });
    if (!marketplace || !marketplace.active) throw new NotFoundException('Marketplace não encontrado ou inativo.');
  }
}
