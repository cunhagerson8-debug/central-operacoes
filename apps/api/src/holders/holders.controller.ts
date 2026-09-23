import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { CreateHolderDto } from './dto/create-holder.dto';
import { CreateHolderDocumentDto } from './dto/create-holder-document.dto';
import { HoldersService } from './holders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

@Controller('holders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HoldersController {
  constructor(
    private readonly holdersService: HoldersService,
  ) {}

  @Post()
  @Permissions('holder.create')
  async create(@Body() dto: CreateHolderDto) {
    return this.holdersService.create(dto);
  }

  @Get()
  @Permissions('holder.view')
  async findAll() {
    return this.holdersService.findAll();
  }

  @Get(':id')
  @Permissions('holder.view')
  async findOne(@Param('id') id: string) {
    return this.holdersService.findOne(id);
  }
  
  @Post(':id/documents')
  @Permissions('holder.create')
  @UseInterceptors(FileInterceptor('file'))
  async createDocument(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body() dto: CreateHolderDocumentDto,
  ) {
    return this.holdersService.createDocument(id, dto, file);
  }

@Get(':id/documents')
@Permissions('holder.view')
async findDocuments(@Param('id') id: string) {
  return this.holdersService.findDocuments(id);
}

@Get(':id/documents/:documentId/download')
@Permissions('holder.view')
async downloadDocument(
  @Param('id') id: string,
  @Param('documentId') documentId: string,
) {
  return this.holdersService.getDocumentDownloadUrl(id, documentId);
}

}