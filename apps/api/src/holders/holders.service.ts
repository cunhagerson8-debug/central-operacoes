import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHolderDto } from './dto/create-holder.dto';
import { CreateHolderDocumentDto } from './dto/create-holder-document.dto';


@Injectable()
export class HoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.holder.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const holder = await this.prisma.holder.findUnique({
      where: { id },
    });

    if (!holder) {
      throw new NotFoundException('Responsável não encontrado.');
    }

    return holder;
  }
    async create(dto: CreateHolderDto) {
    return this.prisma.holder.create({
      data: {
        fullName: dto.fullName,
        cpf: dto.cpf,
        phone: dto.phone,
        email: dto.email,
      },
    });
  }

  async createDocument(holderId: string, dto: CreateHolderDocumentDto) {
    await this.findOne(holderId);

    return this.prisma.holderDocument.create({
      data: {
        holderId,
        category: dto.category,
        name: dto.name,
        fileUrl: dto.fileUrl,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        status: dto.status || 'PENDING',
        notes: dto.notes,
      },
    });
  }

async findDocuments(holderId: string) {
  await this.findOne(holderId);

  return this.prisma.holderDocument.findMany({
    where: {
      holderId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

}
