/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Task } from './entities/task.entity';
import { User } from 'src/users/entities/user.entity';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RescheduleTaskDto } from './dto/reschedule-task.dto';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: Task,
  })
  createTask(@Body() createTaskDto: CreateTaskDto, @Req() req): Promise<Task> {
    const user = req.user as User;
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of tasks', type: [Task] })
  getTasksByUser(@Req() req): Promise<Task[]> {
    const user = req.user as User;
    return this.tasksService.getTasksByUser(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  @ApiResponse({ status: 200, description: 'Task details', type: Task })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getTaskById(@Param('id') id: string, @Req() req): Promise<Task> {
    const user = req.user as User;
    return this.tasksService.getTaskById(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task by ID' })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req,
  ): Promise<Task> {
    const user = req.user as User;
    return this.tasksService.updateTask(id, updateTaskDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task by ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  deleteTask(@Param('id') id: string, @Req() req): Promise<void> {
    const user = req.user as User;
    return this.tasksService.deleteTask(id, user);
  }
  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reschedule a task' })
  @ApiResponse({
    status: 200,
    description: 'Task rescheduled successfully',
    type: Task,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 400, description: 'Invalid new scheduled time' })
  async rescheduleTask(
    @Param('id') id: string,
    @Body() rescheduleTaskDto: RescheduleTaskDto,
    @Req() req,
  ) {
    const user = req.user as User;
    return this.tasksService.rescheduleTask(id, rescheduleTaskDto, user);
  }
}
