import {
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Body,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NullableType } from '@/auth/utils/types/nullable.type';
import { UserResDto } from './dto/user-res.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({ path: '/users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResDto> {
    return plainToInstance(
      UserResDto,
      await this.userService.create(createUserDto),
    );
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: UserResDto })
  @HttpCode(HttpStatus.OK)
  public async me(@Request() request): Promise<NullableType<UserResDto>> {
    return plainToInstance(
      UserResDto,
      await this.userService.me(request.user.id),
    );
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResDto })
  public async update(
    @Request() request,
    @Body() userDto: UpdateUserDto,
  ): Promise<NullableType<UserResDto>> {
    return plainToInstance(
      UserResDto,
      await this.userService.update(request.user.id, userDto),
    );
  }

  @Delete('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return await this.userService.softDelete(request.user.id);
  }
}
