import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Parameter decorator to extract the current user from the request
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 *
 * @example
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) {
 *   return this.userService.findById(userId);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    // If a specific field is requested, return just that field
    if (data) {
      return user[data];
    }

    // Otherwise return the entire user object
    return user;
  }
);
