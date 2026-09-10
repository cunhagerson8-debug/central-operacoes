import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentBeneficiaryDto } from './dto/create-payment-beneficiary.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createBeneficiary(dto: CreatePaymentBeneficiaryDto) {
    return this.prisma.paymentBeneficiary.create({
      data: {
        name: dto.name.trim(),
        document: dto.document?.trim(),
        pixKey: dto.pixKey?.trim(),
        pixKeyType: dto.pixKeyType,
        bankName: dto.bankName?.trim(),
        notes: dto.notes?.trim(),
      },
    });
  }

  async findAllBeneficiaries() {
    return this.prisma.paymentBeneficiary.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

async createPayment(dto: CreatePaymentDto) {
  return this.prisma.payment.create({
    data: {
      beneficiaryId: dto.beneficiaryId,
      companyId: dto.companyId,
      category: dto.category,
      description: dto.description?.trim(),
      amount: dto.amount,
      dueDay: dto.dueDay,
      referenceMonth: dto.referenceMonth,
      referenceYear: dto.referenceYear,
      status: dto.status,
      notes: dto.notes?.trim(),
    },
  });
}

async findAllPayments() {
  return this.prisma.payment.findMany({
    include: {
      beneficiary: true,
      company: true,
    },
    orderBy: [
      {
        referenceYear: 'desc',
      },
      {
        referenceMonth: 'desc',
      },
      {
        dueDay: 'asc',
      },
    ],
  });
}

}