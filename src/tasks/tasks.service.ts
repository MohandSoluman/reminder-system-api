import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RescheduleTaskDto } from './dto/reschedule-task.dto';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { instanceToPlain } from 'class-transformer';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    private readonly notificationsService: NotificationsService,
    @InjectQueue('reminders') private readonly reminderQueue: Queue,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    try {
      if (!createTaskDto.scheduledTime) {
        throw new BadRequestException('Scheduled time is required');
      }

      const taskScheduledTime = new Date(createTaskDto.scheduledTime);
      if (isNaN(taskScheduledTime.getTime())) {
        throw new BadRequestException('Invalid date format for scheduledTime');
      }

      const currentTime = new Date();
      if (taskScheduledTime <= currentTime) {
        console.log(taskScheduledTime);
        throw new BadRequestException('Scheduled time must be in the future');
      }

      const task = this.taskRepository.create({
        ...createTaskDto,
        scheduledTime: taskScheduledTime,
        user,
      });
      const savedTask = await this.taskRepository.save(task);

      await this.scheduleReminders(savedTask);
      return instanceToPlain(savedTask) as Task;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to create task: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Failed to create task: An unknown error occurred');
      }
      throw new BadRequestException('Failed to create task');
    }
  }

  async getTasksByUser(user: User): Promise<Task[]> {
    try {
      return await this.taskRepository.find({
        where: { user: { id: user.id } },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to fetch tasks: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error('Failed to fetch tasks: An unknown error occurred');
      }
      throw new InternalServerErrorException('Failed to fetch tasks');
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    try {
      // const cacheKey = `task:${id}`;
      // const cachedTask = await this.redisClient.get(cacheKey);

      // if (cachedTask) {
      //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      //   return JSON.parse(cachedTask);
      // }
      const task = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.user', 'user')
        .where('task.id = :id', { id })
        .andWhere('task.user.id = :userId', { userId: user.id })
        .getOne();
      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      return instanceToPlain(task) as Task;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to fetch task details: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to fetch task details: An unknown error occurred`,
        );
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching task details');
    }
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    try {
      const task = await this.getTaskById(id, user);

      this.taskRepository.merge(task, updateTaskDto);

      const updatedTask = await this.taskRepository.save(task);

      if (updateTaskDto.scheduledTime) {
        await this.scheduleReminders(updatedTask);
      }

      return instanceToPlain(updatedTask) as Task;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to update task: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Failed to update task: An unknown error occurred`);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async deleteTask(id: string, user: User): Promise<void> {
    try {
      const task = await this.getTaskById(id, user);

      if (!task) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      // Remove any pending jobs related to the task from the queue
      await this.removeJobsByTaskId(id);

      const result = await this.taskRepository.delete({
        id,
        user: { id: user.id },
      });

      if (result.affected === 0) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete task: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Failed to delete task: An unknown error occurred`);
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
  async rescheduleTask(
    id: string,
    rescheduleTaskDto: RescheduleTaskDto,
    user: User,
  ): Promise<Task> {
    try {
      const task = await this.getTaskById(id, user);

      const newScheduledTime = new Date(rescheduleTaskDto.newScheduledTime);
      const currentTime = new Date();

      if (newScheduledTime <= currentTime) {
        throw new BadRequestException(
          'New scheduled time must be in the future',
        );
      }

      // Update the task's scheduled time
      task.scheduledTime = newScheduledTime;

      const updatedTask = await this.taskRepository.save(task);
      await this.scheduleReminders(updatedTask);

      return instanceToPlain(updatedTask) as Task;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Re-throw specific exceptions
      }
      throw new InternalServerErrorException('Failed to reschedule task');
    }
  }

  async getTaskDetails(taskId: string): Promise<Task | undefined> {
    try {
      const task = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.user', 'user')
        .leftJoinAndSelect(
          'user.notificationPreferences',
          'notificationPreferences',
        )
        .where('task.id = :taskId', { taskId })
        .getOne();
      if (!task) {
        throw new NotFoundException(`Task with ID ${taskId} not found`);
      }

      return instanceToPlain(task) as Task;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to fetch task details: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(
          `Failed to fetch task details: An unknown error occurred`,
        );
      }

      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching task details');
    }
  }

  async scheduleReminders(task: Task): Promise<void> {
    const { id, scheduledTime, user } = task;

    const userPreferences = await this.notificationsService.getPreferences(
      user.id,
    );
    if (!userPreferences) {
      throw new InternalServerErrorException('User preferences not found');
    }
    const { reminder_time } = userPreferences;

    // Schedule first reminder (X minutes before, based on user preference)
    const firstReminderTime = new Date(
      scheduledTime.getTime() - reminder_time * 60000,
    );

    const currentTime = new Date();
    const minLeadTime = 5 * 60 * 1000; // Minimum required time before scheduling (5 minutes)

    if (scheduledTime.getTime() - currentTime.getTime() < minLeadTime) {
      throw new BadRequestException(
        'Task must be scheduled at least 5 minutes in the future.',
      );
    }

    await this.reminderQueue.add(
      'send-reminder',
      { taskId: id, type: 'first' },
      { delay: firstReminderTime.getTime() - Date.now() },
    );
    this.logger.log(`First reminder added to queue for task ${id}`);

    // Schedule final reminder (at scheduled time)
    await this.reminderQueue.add(
      'send-reminder',
      { taskId: id, type: 'final' },
      { delay: scheduledTime.getTime() - Date.now() },
    );
    this.logger.log(`Final reminder added to queue for task ${id}`);
  }
  async removeJobsByTaskId(taskId: string): Promise<void> {
    const jobs = await this.reminderQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);
    for (const job of jobs) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (job.data.taskId === taskId) {
        await job.remove();
      }
    }
  }
}
