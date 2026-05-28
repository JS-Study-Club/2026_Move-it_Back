import { IsDateString, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";
import { Type } from 'class-transformer';

export class CreateMusicDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '음악 제목' })
    name!: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '음악 장르' })
    genre!: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '음악 아티스트' })
    artist!: string

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @ApiProperty({ description: '음악 길이 (초)' })
    length!: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '음악 URL' })
    music_url!: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '앨범 아트 URL' })
    album_art_url!: string

    @IsDateString()
    @ApiProperty({ description: '음악 발매일', required: false })
    release_date?: Date

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '챌린지 설명' })
    description!: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: '챌린지 난이도' })
    difficulty!: string

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ description: '하이라이트 구간 시작 시간(초)', required: false, default: 0 })
    start_time?: number

    @IsNumber()
    @Type(() => Number)
    @ApiProperty({ description: '하이라이트 구간 종료 시간(초)', required: false })
    end_time?: number

    @IsOptional()
    @ApiProperty({ type: 'string', format: 'binary', required: false, description: '업로드할 챌린지 영상 파일' })
    video?: any;
}