import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateHolderDto {
  @IsString()
  @Length(2, 150)
  fullName!: string;

  @IsString()
  @Length(11, 14)
  cpf!: string;

  @IsOptional()
  @IsString()
  @Length(8, 30)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}