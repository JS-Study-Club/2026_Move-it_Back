<<<<<<< HEAD
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
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '@/utils/types/nullable.type';
import { UserResDto } from './dto/user-res.dto';
=======
import { Controller } from '@nestjs/common';
import { UserService } from './user.service';
>>>>>>> upstream/dev

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({ path: '/users', version: '1' })
export class UserController {
  constructor(private readonly userService: UserService) {}
<<<<<<< HEAD

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<UserResDto> {
    return this.userService.create(createUserDto);
  }

  // @Get(':id') // 유저의 아이디로 다른 사람들을 조회 // 현재 필요 없을거같아서 없앰
  // @HttpCode(HttpStatus.OK)
  // @ApiParam({ name: 'id', type: String, required: true })
  // findOne(@Param('id') id: User['id']): Promise<NullableType<User>> {
  //   return this.userService.findById(id);
  // }

  // @Patch(':id')
  // @HttpCode(HttpStatus.OK)
  // @ApiParam({ name: 'id', type: String, required: true })
  // update(
  //   @Param('id') id: User['id'],
  //   @Body() updateUserDto: UpdateUserDto,
  // ): Promise<User | null> {
  //   return this.userService.update(id, updateUserDto);
  // }

  // @Delete(':id')
  // @ApiParam({
  //   name: 'id',
  //   type: String,
  //   required: true,
  // })
  // @HttpCode(HttpStatus.NO_CONTENT)
  // remove(@Param('id') id: User['id']): Promise<void> {
  //   return this.userService.delete(id);
  // }

  // auth 부분의 me가 필요없을 거 같앗 ㅓ
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOkResponse({ type: UserResDto })
  @HttpCode(HttpStatus.OK)
  public me(@Request() request): Promise<NullableType<UserResDto>> {
    return this.userService.me(request.user.id);
  }

  @Patch('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserResDto })
  public update(
    @Request() request,
    @Body() userDto: UpdateUserDto,
  ): Promise<NullableType<UserResDto>> {
    return this.userService.update(request.user, userDto);
  }

  @Delete('me')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Request() request): Promise<void> {
    return await this.userService.softDelete(request.user.id);
  }
=======
>>>>>>> upstream/dev
}
