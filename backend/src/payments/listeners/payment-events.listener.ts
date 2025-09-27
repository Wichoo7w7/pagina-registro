import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PAYMENT_EVENTS } from '../events/payment-events.constants';
import { EmailService } from '../../notifications/services/email.service';

interface PaymentApprovedPayload { userEmail: string; boletaNumber: string; }
interface PaymentRejectedPayload { userEmail: string; boletaNumber: string; reason?: string; }

@Injectable()
export class PaymentEventsListener {
  constructor(private email: EmailService) {}

  @OnEvent(PAYMENT_EVENTS.APPROVED)
  handleApproved(payload: PaymentApprovedPayload) {
    this.email.sendPaymentApprovedEmail(payload.userEmail, payload.boletaNumber);
  }

  @OnEvent(PAYMENT_EVENTS.REJECTED)
  handleRejected(payload: PaymentRejectedPayload) {
    this.email.sendPaymentRejectedEmail(payload.userEmail, payload.boletaNumber, payload.reason);
  }
}
