import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreatePaymentBeneficiaryDto } from './dto/create-payment-beneficiary.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('beneficiaries')
  @Permissions('payment.create')
  createBeneficiary(@Body() dto: CreatePaymentBeneficiaryDto) {
    return this.paymentsService.createBeneficiary(dto);
  }

  @Get('beneficiaries')
  @Permissions('payment.view')
  findAllBeneficiaries() {
    return this.paymentsService.findAllBeneficiaries();
  }

  @Delete('beneficiaries/:id')
@Permissions('payment.create')
deleteBeneficiary(@Param('id') id: string) {
  return this.paymentsService.deleteBeneficiary(id);
}

  @Post()
  @Permissions('payment.create')
createPayment(@Body() dto: CreatePaymentDto) {
  return this.paymentsService.createPayment(dto);
}

@Get()
@Permissions('payment.view')
findAllPayments() {
  return this.paymentsService.findAllPayments();
}

}