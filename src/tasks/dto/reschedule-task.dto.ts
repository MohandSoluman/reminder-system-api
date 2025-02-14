import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleTaskDto {
  @ApiProperty({
    description: 'New scheduled time for the task',
    example: '2023-12-31T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  newScheduledTime!: Date;
}
