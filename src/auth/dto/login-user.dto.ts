import { IsDate, IsEmail, IsNotEmpty, IsString } from "class-validator";

// // TODO : 테이블에 맞는 수정 필요
// export class SignupDto {
//     @IsString()
//     @IsNotEmpty()
//     first_name: string;

//     @IsString()
//     @IsNotEmpty()
//     last_name: string;

//     @IsString()
//     @IsDate()
//     @IsNotEmpty()
//     dob: Date;

//     @IsString()
//     @IsNotEmpty()
//     password: string;

//     @IsString()
//     @IsNotEmpty()
//     username: string;


//     @IsNotEmpty()
//     @IsEmail()
//     email: string;
//     id: any;
// }
export class LoginDto {
    username: string;
    password: string;
}