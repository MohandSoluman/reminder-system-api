import { Exclude } from 'class-transformer';
import { Task } from 'src/tasks/entities/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { NotificationPreference } from 'src/notifications/entities/notification-preference.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_token!: string;

  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks!: Task[];

  @OneToOne(() => NotificationPreference, (pref) => pref.user, {
    cascade: true,
  })
  notificationPreferences!: NotificationPreference;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
