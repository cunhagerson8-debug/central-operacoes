import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

 async findAll(page = 1, limit = 50) {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 && limit <= 100 ? limit : 50;

  const [companies, total] = await this.prisma.$transaction([
    this.prisma.company.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
    this.prisma.company.count(),
  ]);

  return {
    data: companies,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return company;
  }
    async create(dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name,
        legalName: dto.legalName,
        document: dto.document,
        documentType: dto.documentType,
        holderId: dto.holderId,
        phone: dto.phone,
        email: dto.email,
        zipCode: dto.zipCode,
street: dto.street,
number: dto.number,
complement: dto.complement,
neighborhood: dto.neighborhood,
city: dto.city,
state: dto.state,
        notes: dto.notes,
      },
      
    });
    
  }
  async update(id: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        legalName: dto.legalName,
        document: dto.document,
        documentType: dto.documentType,
        holderId: dto.holderId,
        phone: dto.phone,
        email: dto.email,
        zipCode: dto.zipCode,
street: dto.street,
number: dto.number,
complement: dto.complement,
neighborhood: dto.neighborhood,
city: dto.city,
state: dto.state,
        notes: dto.notes,
      },
    });
  }
}
