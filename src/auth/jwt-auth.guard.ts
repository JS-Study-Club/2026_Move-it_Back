import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from 'node_modules/@nestjs/core';
import { AuthGuard } from 'node_modules/@nestjs/passport';
import { Observable } from 'rxjs';

export const IS_PUBLIC_KEY = 'isPublic';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
    
//     // 1. 요청 헤더에서 토큰을 추출하거나 사용자 정보를 확인하는 로직
//     // 2. 인증/권한 로직 수행 (예: validateRequest(request))
    
//     return validateRequest(request); // true면 통과, false면 403 Forbidden
//   }
// }  



@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}