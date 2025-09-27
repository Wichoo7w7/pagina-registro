import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopDto } from './create-workshop.dto';
import { IsOptional, IsDateString, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  cupoMaximo?: number;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
