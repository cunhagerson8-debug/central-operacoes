import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  @Length(2, 150)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  legalName?: string;

  @IsString()
  @Length(5, 30)
  document!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsOptional()
@IsUUID()
holderId?: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
@IsString()
@Length(8, 10)
zipCode?: string;

@IsOptional()
@IsString()
@Length(2, 200)
street?: string;

@IsOptional()
@IsString()
@Length(1, 20)
number?: string;

@IsOptional()
@IsString()
@Length(1, 120)
complement?: string;

@IsOptional()
@IsString()
@Length(2, 120)
neighborhood?: string;

@IsOptional()
@IsString()
@Length(2, 120)
city?: string;

@IsOptional()
@IsString()
@Length(2, 2)
state?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}