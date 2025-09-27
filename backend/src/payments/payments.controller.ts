import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PaymentStatus } from '../entities/Payment';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('boletaImage'))
  async create(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body() dto: CreatePaymentDto) {
    return this.payments.createPayment(req.user.sub, dto, file);
  }

  @Get('my-payments')
  async myPayments(@Req() req: any) {
    return this.payments.findUserPayments(req.user.sub);
  }

  @Get()
  @Roles('admin')
  async findAll(
    @Query('status') status?: PaymentStatus,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    return this.payments.findAll({ status, userId, dateFrom, dateTo });
  }

  @Patch(':id/approve')
  @Roles('admin')
  async approve(@Param('id') id: string, @Req() req: any) {
    return this.payments.approvePayment(id, req.user.sub);
  }

  @Patch(':id/reject')
  @Roles('admin')
  async reject(@Param('id') id: string, @Req() req: any, @Body() dto: UpdatePaymentStatusDto) {
    return this.payments.rejectPayment(id, dto, req.user.sub);
  }
}
