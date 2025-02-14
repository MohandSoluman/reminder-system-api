import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min, Max } from 'class-validator';

export class UpdatePreferencesDto {
  @ApiProperty({ description: 'Enable push notifications', default: true })
  @IsBoolean()
  pushEnabled!: boolean;

  @ApiProperty({ description: 'Enable email notifications', default: true })
  @IsBoolean()
  emailEnabled!: boolean;

  @ApiProperty({ description: 'Reminder time in minutes (1-60)', default: 5 })
  @IsInt()
  @Min(1)
  @Max(60)
  reminderTime!: number;
}
