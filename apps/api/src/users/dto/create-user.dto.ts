import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsIn(['SUPER_ADMIN', 'GESTOR', 'OPERADOR'])
  role!: string;
}