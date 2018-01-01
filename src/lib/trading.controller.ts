import { Get, Post, Response, Body, Controller, HttpStatus } from '@nestjs/common';

import { TradingService } from './trading.service';

@Controller('api/v1')
export class TradingController {

  constructor(private tradingService: TradingService) { }

  @Post('order')
  async order( @Response() res, @Body('accountId') accountId, @Body('orderInfo') orderInfo) {
    await this.tradingService.order(accountId, orderInfo);
    res.status(HttpStatus.OK).send();
  }
}
