import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('notification_preferences')
export class NotificationPreference {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier for the notification preference',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    type: () => User,
    description: 'The user associated with this preference',
  })
  @OneToOne(() => User, (user) => user.notificationPreferences, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @ApiProperty({
    example: true,
    description: 'Whether push notifications are enabled',
  })
  @Column({ type: 'boolean', default: true })
  push_enabled!: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether email notifications are enabled',
  })
  @Column({ type: 'boolean', default: true })
  email_enabled!: boolean; // 🔧 Fixed incorrect type (was number, should be boolean)

  @ApiProperty({
    example: 5,
    description: 'Reminder time in minutes before the task is due',
  })
  @Column({ type: 'int', default: 5 })
  reminder_time!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
