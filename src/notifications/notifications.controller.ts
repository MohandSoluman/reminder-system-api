import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UpdatePreferencesDto } from './dto/update-prefrances.dto';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiBody({ type: UpdatePreferencesDto })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePreferences(
    @Req() req,
    @Body() updatePreferencesDto: UpdatePreferencesDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = req.user as User;
    const userId = user.id;
    return this.notificationsService.updatePreferences(
      userId,
      updatePreferencesDto,
    );
  }
}
