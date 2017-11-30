import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';

@Module({
  modules: [],
  controllers: [TradingController],
  components: [],
})
export class TradingModule { }
