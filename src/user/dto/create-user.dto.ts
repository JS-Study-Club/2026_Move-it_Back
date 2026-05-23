import {
    Transform,
  } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  // decorators here
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class CreateUserDto {
	@ApiProperty({ example: 'John', type: String })
	@IsNotEmpty()
	userName : string;
	
	@ApiProperty({ example: 'test1@example.com', type: String })
	@Transform(lowerCaseTransformer)
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({ example: 'younan1', type: String})
	@IsNotEmpty()
	userId: string;

	@ApiProperty()
	@MinLength(6)
	password: string;

	@IsNotEmpty() //TODO :  Id validation
	teacherId: string;
}