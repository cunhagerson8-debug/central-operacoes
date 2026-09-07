import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.internalUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
  async create(dto: CreateUserDto) {
  const email = dto.email.trim().toLowerCase();

  const existingUser = await this.prisma.internalUser.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('Já existe um usuário com este e-mail.');
  }

  const role = await this.prisma.role.findUnique({
    where: { name: dto.role },
  });

  if (!role) {
    throw new NotFoundException('Perfil de acesso não encontrado.');
  }

  const passwordHash = await bcrypt.hash(dto.password, 12);

  return this.prisma.internalUser.create({
    data: {
      name: dto.name.trim(),
      email,
      passwordHash,
      status: 'ACTIVE',
      userRoles: {
        create: {
          roleId: role.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true,
      userRoles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

async deactivate(id: string) {
  const user = await this.prisma.internalUser.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundException('Usuário não encontrado.');
  }

  const isSuperAdmin = user.userRoles.some(
    (userRole) => userRole.role.name === 'SUPER_ADMIN',
  );

  if (isSuperAdmin) {
    throw new ConflictException('O SUPER_ADMIN não pode ser desativado.');
  }

  return this.prisma.internalUser.update({
    where: { id },
    data: {
      status: 'INACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });
}

}