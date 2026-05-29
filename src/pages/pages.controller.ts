import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchChallengeDto } from './dto/search-challenge.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  // @Post()
  // create(@Body() createPageDto: CreatePageDto) {
  //   return this.pagesService.create(createPageDto);
  // }

  // @Get()
  // findAll() {
  //   return this.pagesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.pagesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
  //   return this.pagesService.update(+id, updatePageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pagesService.remove(+id);
  // }

  @Get('home')
  @ApiOperation({ summary: '홈 화면 정보 가져오기' })
  @ApiBearerAuth() // TODO : useGuard 여부
  @HttpCode(HttpStatus.NO_CONTENT)
  async getHomePageData(@Query('userId') userId: string) {
    // TODO: 반환형 설계
    return await this.pagesService.getHomePageData(userId);
  }

  @Get('search')
  @ApiOperation({ summary: '검색 화면 정보 가져오기' })
  @ApiBearerAuth() // TODO : useGuard 여부
  async getSearchPage() {
    return await this.pagesService.getSearchPageData();
  }

  @Post('search')
  @ApiOperation({ summary: '댄스 챌린지 검색' }) // TODO : page 스크롤 처리
  @ApiResponse({})
  async searchChallenges(@Body() searchChallengeDto: SearchChallengeDto) {
    return await this.pagesService.searchChallenges(searchChallengeDto.target);
  }

  @Get('dance-dashboard')
  @ApiOperation({ summary: '리듬에 관한 피드백 전달' })
  @ApiQuery({
    name: 'type',
    required: true,
    default: 'rhythm',
    enum: ['accuracy', 'expression', 'rhythm'],
    example: 'rhythm',
  })
  @ApiResponse({
    status: 200,
    description: '피드백 조회 성공',
    // dto
  })
  async getDanceDashBoard(@Query('type') type: string) {
    return await this.pagesService.getLastestDanceData(type);
  }

  // TODO : userController 활용
  // @Get('dance')
  // @ApiOperation({summary: '댄스 화면 정보 가져오기'})
  // @ApiBearerAuth() // TODO : useGuard 여부
  // async getDancePage(){

  // }

  // @Get('my')
  // @ApiOperation({summary: '홈 화면 정보 가져오기'})
  // @ApiBearerAuth() // TODO : useGuard 여부
  // async
}
