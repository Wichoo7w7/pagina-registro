import { IsUUID } from 'class-validator';

export class EnrollWorkshopDto {
  @IsUUID()
  workshopId!: string;
}
