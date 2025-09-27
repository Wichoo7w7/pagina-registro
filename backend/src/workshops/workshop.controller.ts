import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { EnrollmentService } from './enrollment.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { EnrollWorkshopDto } from './dto/enroll-workshop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class WorkshopController {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly enrollmentService: EnrollmentService,
  ) {}

  @Post('workshops')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshopService.create(dto);
  }

  @Get('workshops')
  @Public()
  findAll(
    @Query('activo') activo?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('disponible') disponible?: string,
  ) {
    return this.workshopService.findAll({
      activo: activo !== undefined ? activo === 'true' : undefined,
      desde: desde ? new Date(desde) : undefined,
      hasta: hasta ? new Date(hasta) : undefined,
      disponible: disponible !== undefined ? disponible === 'true' : undefined,
    });
  }

  @Get('workshops/:id')
  @Public()
  findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.workshopService.findOne(id, userId);
  }

  @Patch('workshops/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateWorkshopDto) {
    return this.workshopService.update(id, dto);
  }

  @Delete('workshops/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.workshopService.remove(id);
  }

  @Post('workshops/:id/enroll')
  @UseGuards(JwtAuthGuard)
  enroll(@Param('id') id: string, @Req() req: any) {
    return this.workshopService.enrollStudent(req.user, id);
  }

  @Get('enrollments/my-enrollments')
  @UseGuards(JwtAuthGuard)
  myEnrollments(@Req() req: any) {
    return this.enrollmentService.findUserEnrollments(req.user.id);
  }
}
