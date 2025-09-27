import { IsEmail, IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @Matches(/^[A-Za-z0-9._%+-]+@umg\.edu\.gt$/,{ message: 'El email debe ser dominio umg.edu.gt' })
  email!: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  // Debe ser validado adicionalmente por el util de password strength
  password!: string;

  @IsNotEmpty()
  confirmPassword!: string;

  @IsNotEmpty()
  nombreCompleto!: string;

  @IsNotEmpty()
  carnet!: string;

  @IsNotEmpty()
  facultad!: string;
}
