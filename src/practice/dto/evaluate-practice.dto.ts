import { IsArray, IsNotEmpty } from 'class-validator';

export class EvaluatePracticeDto {
  @IsArray()
  @IsNotEmpty()
  user_pose_data!: any[];
}
