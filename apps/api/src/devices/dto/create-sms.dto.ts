import { IsDateString, IsString, Length } from 'class-validator';

export class CreateSmsDto {
  @IsString()
  @Length(1, 80)
  sender!: string;

  @IsString()
  @Length(1, 5000)
  message!: string;

  @IsDateString()
  receivedAt!: string;
}
