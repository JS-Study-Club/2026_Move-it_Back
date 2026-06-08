import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SearchChallengeDto } from './dto/search-challenge.dto';
import { PageHomeResDto } from './dto/page-home.res.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChallengeInfo } from './dto/page-search.res.dto';

@ApiTags('Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('home')
  @ApiOperation({ summary: '홈 화면 정보 가져오기' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    status: 200,
    description: '홈 화면 정보 조회 성공',
    type: PageHomeResDto,
  })
  async getHomePageData(@Req() req: any): Promise<PageHomeResDto> {
    const userId = req.user.id;
    return await this.pagesService.getHomePageData(userId);
  }

  @Get('search')
  @ApiOperation({ summary: '검색 화면 정보 가져오기' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: '검색 화면 정보 조회 성공',
  })
  async getSearchPage() {
    return await this.pagesService.getSearchPageData();
  }

  @Post('search')
  @ApiOperation({ summary: '댄스 챌린지 검색' })
  @ApiBody({ type: SearchChallengeDto })
  @ApiResponse({
    status: 201,
    description: '댄스 챌린지 검색 성공',
    type: [ChallengeInfo],
  })
  async searchChallenges(
    @Body() searchChallengeDto: SearchChallengeDto,
  ): Promise<ChallengeInfo[]> {
    return await this.pagesService.searchChallenges(searchChallengeDto.target);
  }

  @Get('dance')
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
  })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async getDashBoardPageData(@Req() req: any, @Query('type') type: string) {
    return await this.pagesService.getDashboardPageData(req.user.id, type);
  }

  @Get('my')
  @ApiOperation({ summary: '홈 화면 정보 가져오기' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    status: 200,
    description: '마이페이지 정보 조회 성공',
  })
  async getMyPageData(@Req() req: any) {
    return await this.pagesService.getMyPageData(req.user.id);
  }
}
