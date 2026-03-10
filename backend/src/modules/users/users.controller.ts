import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateLoginDto } from '../auth/dto/update-me.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  updateMyLogin(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateLoginDto,
  ) {
    return this.usersService.updateLogin(user.sub, dto.login);
  }

  @Delete('me')
  deleteMyAccount(@CurrentUser() user: { sub: string }) {
    return this.usersService.deleteById(user.sub);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  deleteUserByAdmin(@Param('id') id: string) {
    return this.usersService.deleteById(id);
  }
}
