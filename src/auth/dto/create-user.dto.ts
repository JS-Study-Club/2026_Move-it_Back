import { IsNotEmpty, IsString } from "class-validator";
import { Exclude, Expose } from 'class-transformer'

// TODO : 테이블에 맞는 수정 필요
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

// import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

// export class CreateUserDto {
//   @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
//   email: string;

//   @IsString()
//   @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
//   password: string;

//   @IsOptional() // 없어도 되는 필드
//   nickname?: string;
// }