import {
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateHolderDocumentDto {
  @IsString()
  @Length(2, 80)
  category!: string;

  @IsString()
  @Length(2, 150)
  name!: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}