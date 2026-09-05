import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SmsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: {
    companyId?: string;
    deviceId?: string;
    driverId?: string;
    read?: string;
    search?: string;
  }) {
    return this.prisma.deviceSmsMessage.findMany({
      where: {
        deviceId: filters.deviceId,
        readAt: filters.read === undefined ? undefined : filters.read === 'true' ? { not: null } : null,
        device: {
          companyId: filters.companyId,
          driverId: filters.driverId,
        },
        OR: filters.search
          ? [
              { sender: { contains: filters.search, mode: 'insensitive' } },
              { message: { contains: filters.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        device: {
          include: {
            company: { select: { id: true, name: true } },
          }, 
        },
      },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    const sms = await this.prisma.deviceSmsMessage.findUnique({ where: { id } });

    if (!sms) {
      throw new NotFoundException('SMS não encontrado.');
    }

    return this.prisma.deviceSmsMessage.update({
      where: { id },
      data: { readAt: sms.readAt ?? new Date() },
    });
  }
}
