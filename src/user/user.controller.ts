import { Controller, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Body, Patch, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { User } from './entities/user.entitiy';
import { NullableType } from '@/utils/types/nullable.type';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({path: 'user', version: '1'})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<User>{
    return this.userService.create(createUserDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({name:'id', type:String, required:true})
  findOne(@Param('id') id: User['id']) : Promise<NullableType<User>> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({name:'id', type:String, required:true})
  update(
    @Param('id') id: User['id'],
    @Body() updateUserDto: UserUpdateDto,
  ): Promise<User|null>{
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: User['id']): Promise<void> {
    return this.userService.remove(id);
  }
}

