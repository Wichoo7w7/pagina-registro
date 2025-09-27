import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  token!: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  newPassword!: string;

  @IsNotEmpty()
  confirmPassword!: string;
}
