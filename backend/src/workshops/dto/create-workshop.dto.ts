import { IsString, IsNotEmpty, IsInt, Min, Max, IsDateString, IsBoolean, Length } from 'class-validator';

export class CreateWorkshopDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 120)
  instructor!: string;

  @IsInt()
  @Min(1)
  @Max(10000)
  cupoMaximo!: number;

  @IsDateString()
  fechaInicio!: string;

  @IsDateString()
  fechaFin!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 120)
  horario!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  lugar!: string;

  @IsBoolean()
  activo!: boolean;
}
