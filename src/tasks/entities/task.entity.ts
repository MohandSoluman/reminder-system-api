import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('tasks')
export class Task {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({ description: 'Title of the task', example: 'Buy groceries' })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Description of the task',
    example: 'Milk, Bread, Eggs',
  })
  @Column({ nullable: true })
  description!: string;

  @ApiProperty({
    description: 'Scheduled time for the task',
    example: '2023-12-25T10:00:00Z',
  })
  @Column({ type: 'timestamp', nullable: false })
  @Index()
  scheduledTime!: Date;

  @ApiProperty({
    description: 'Whether the task is completed',
    example: false,
  })
  @Column({ default: false })
  isCompleted!: boolean;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user!: User;
}
