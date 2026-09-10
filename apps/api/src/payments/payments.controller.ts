import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { CreatePaymentBeneficiaryDto } from './dto/create-payment-beneficiary.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
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