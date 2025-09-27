import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { Role, RoleName } from '../entities/Role';
import { StudentProfile } from '../entities/StudentProfile';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../notifications/services/email.service';
import { isStrongPassword } from './util/password.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(StudentProfile) private profileRepo: Repository<StudentProfile>,
    private jwt: JwtService,
    private config: ConfigService,
    private email: EmailService
  ) {}

  async register(dto: RegisterDto) {
    if (dto.password !== dto.confirmPassword) throw new BadRequestException('Passwords no coinciden');
    if (!isStrongPassword(dto.password)) throw new BadRequestException('Password débil');

    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email ya registrado');

    const pepper = this.config.get<string>('PASSWORD_PEPPER','');
    const hashed = await bcrypt.hash(dto.password + pepper, 10);

    const studentRole = await this.roleRepo.findOne({ where: { name: RoleName.STUDENT } });
    if (!studentRole) throw new BadRequestException('Rol student no existe (ejecutar seed)');

    const verificationToken = uuid();

    const user = this.userRepo.create({
      email: dto.email,
      password: hashed,
      isVerified: false,
      verificationToken,
      roles: [studentRole]
    });
    await this.userRepo.save(user);

    const profile = this.profileRepo.create({
      nombreCompleto: dto.nombreCompleto,
      carnet: dto.carnet,
      facultad: dto.facultad,
      user
    });
    await this.profileRepo.save(profile);

    this.email.sendVerificationEmail(user.email, verificationToken);
    return { message: 'Registro exitoso. Revisa tu correo para verificar.' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email }, relations: ['roles'] });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const pepper = this.config.get<string>('PASSWORD_PEPPER','');
    const match = await bcrypt.compare(dto.password + pepper, user.password);
    if (!match) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.isVerified) throw new UnauthorizedException('Cuenta no verificada');

    return this.generateTokens(user);
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, roles: user.roles?.map(r=>r.name) || [] };
    const accessToken = this.jwt.sign(payload);
    return { 
      accessToken, 
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles?.map(r=>r.name) || [],
        isVerified: user.isVerified
      }
    };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('Token inválido');
    user.isVerified = true;
    user.verificationToken = null as any;
    await this.userRepo.save(user);
    return { message: 'Email verificado' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) return { message: 'Si el email existe se enviará un enlace' }; // Evita enumeración
    user.resetToken = uuid();
    await this.userRepo.save(user);
    this.email.sendResetPasswordEmail(user.email, user.resetToken);
    return { message: 'Revisa tu correo si existe la cuenta' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) throw new BadRequestException('Passwords no coinciden');
    if (!isStrongPassword(dto.newPassword)) throw new BadRequestException('Password débil');
    const user = await this.userRepo.findOne({ where: { resetToken: dto.token } });
    if (!user) throw new BadRequestException('Token inválido');

    const pepper = this.config.get<string>('PASSWORD_PEPPER','');
    user.password = await bcrypt.hash(dto.newPassword + pepper, 10);
    user.resetToken = null as any;
    await this.userRepo.save(user);
    return { message: 'Password actualizada' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['roles'] });
    if (!user) return null;
    const pepper = this.config.get<string>('PASSWORD_PEPPER','');
    const match = await bcrypt.compare(password + pepper, user.password);
    if (!match) return null;
    return user;
  }

  async me(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId }, relations: ['roles','studentProfile'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { id: user.id, email: user.email, roles: user.roles.map(r=>r.name), studentProfile: user.studentProfile };
  }
}
