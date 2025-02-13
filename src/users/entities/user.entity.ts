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
} from 'typeorm';

// import { Task } from '../task/task.entity';
// import { NotificationPreference } from '../notification/notification-preference.entity';

@Entity('users')
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password!: string; // Hashed password

  //   @Column({ type: 'varchar', length: 255 })
  //   role!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_token!: string;

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  //   @OneToOne(() => NotificationPreference, (preferences) => preferences.user)
  //   preferences: NotificationPreference;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
