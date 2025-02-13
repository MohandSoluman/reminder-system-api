import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task', example: 'Buy groceries' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Description of the task',
    example: 'Milk, Bread, Eggs',
    required: false,
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Scheduled time for the task',
    example: '2023-12-25T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  scheduledTime!: Date;
}
