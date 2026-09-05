import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

const driverInclude = {
  driverCompanies: {
    include: {
      company: {
        select: { id: true, name: true, status: true },
      },
    },
  },
} as const;

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.driver.findMany({
      include: driverInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: driverInclude,
    });

    if (!driver) {
      throw new NotFoundException('Motorista não encontrado.');
    }

    return driver;
  }

  async create(dto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: {
        fullName: dto.fullName,
        cpf: dto.cpf,
        phone: dto.phone,
        email: dto.email,
        status: dto.status,
        notes: dto.notes,
        driverCompanies: dto.companyIds?.length
          ? { create: dto.companyIds.map((companyId) => ({ companyId })) }
          : undefined,
      },
      include: driverInclude,
    });
  }

  async update(id: string, dto: UpdateDriverDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (transaction) => {
      if (dto.companyIds !== undefined) {
        await transaction.driverCompany.deleteMany({ where: { driverId: id } });
      }

      return transaction.driver.update({
        where: { id },
        data: {
          fullName: dto.fullName,
          cpf: dto.cpf,
          phone: dto.phone,
          email: dto.email,
          status: dto.status,
          notes: dto.notes,
          driverCompanies: dto.companyIds?.length
            ? { create: dto.companyIds.map((companyId) => ({ companyId })) }
            : undefined,
        },
        include: driverInclude,
      });
    });
  }
}
