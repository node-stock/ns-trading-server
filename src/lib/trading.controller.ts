import { Get, Controller } from '@nestjs/common';

@Controller('order/v1')
export class TradingController {
  @Get('/sell')
  root(): string {
    return 'Hello Woaa1rld!';
  }
}
