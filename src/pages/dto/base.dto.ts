// base.dto.ts
import { plainToInstance } from 'class-transformer';

export abstract class BaseDto {
  // 상속받은 자식 클래스 구조에 맞게 자동으로 변환해주는 매직 메서드
  static from<T>(this: new () => T, data: any): T {
    return plainToInstance(this, data);
  }
}
