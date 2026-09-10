import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentBeneficiaryDto } from './dto/create-payment-beneficiary.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('beneficiaries')
  createBeneficiary(@Body() dto: CreatePaymentBeneficiaryDto) {
    return this.paymentsService.createBeneficiary(dto);
  }

  @Get('beneficiaries')
  findAllBeneficiaries() {
    return this.paymentsService.findAllBeneficiaries();
  }

  @Post()
createPayment(@Body() dto: CreatePaymentDto) {
  return this.paymentsService.createPayment(dto);
}

@Get()
findAllPayments() {
  return this.paymentsService.findAllPayments();
}

}