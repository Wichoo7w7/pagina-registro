import { IsIn, IsOptional, IsDateString } from 'class-validator';

export class ExportQueryDto {
  @IsIn(['users','payments','workshops','enrollments'])
  entity!: 'users' | 'payments' | 'workshops' | 'enrollments';

  @IsIn(['csv','xlsx'])
  format!: 'csv' | 'xlsx';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  status?: string; // payments
}
