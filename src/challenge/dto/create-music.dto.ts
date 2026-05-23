import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

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
}