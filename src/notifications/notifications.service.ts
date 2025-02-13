import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  create(createNotificationDto: CreateNotificationDto) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return ` This action adds a new notification ${createNotificationDto.toString()}`;
  }

  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return `This action updates a #${id} notification ${updateNotificationDto.toString()}`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
