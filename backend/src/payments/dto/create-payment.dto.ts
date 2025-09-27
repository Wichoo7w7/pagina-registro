import { IsDateString, IsNotEmpty, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9_-]{4,80}$/)
  boletaNumber!: string;

  @IsDateString()
  boletaDate!: string; // ISO date
}
