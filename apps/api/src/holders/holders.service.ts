import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHolderDto } from './dto/create-holder.dto';

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
}