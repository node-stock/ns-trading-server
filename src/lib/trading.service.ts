import { Component } from '@nestjs/common';
import { HttpException } from '@nestjs/core';

import * as types from 'ns-types';
import { Log } from 'ns-common';
import { WebTrader } from 'ns-trader';

const config = require('config');
Log.init(Log.category.system, Log.level.ALL, 'ns-trading-server');

@Component()
export class TradingService {

  trader: WebTrader;

  constructor() {
    this.trader = new WebTrader(config);
    this.trader.init();
  }

  async order(orderInfo: types.LimitOrder) {
    Log.system.info('下单[启动] ', orderInfo);
    if (orderInfo.backtest === '1') {
      Log.system.info('测试模式，下单[终了] ');
      return;
    }
    if (orderInfo.side === types.OrderSide.Buy) {
      // 买入多单
      await this.trader.buy(orderInfo);
    } else if (orderInfo.side === types.OrderSide.BuyClose) {
      // 卖出多单
      await this.trader.sell(orderInfo);
    } else if (orderInfo.side === types.OrderSide.Sell) {
      Log.system.error('买入空单，尚未实现！');
      // 买入空单
      // TODO
    } else if (orderInfo.side === types.OrderSide.SellClose) {
      Log.system.error('卖出空单，尚未实现！');
      // 卖出空单
      // TODO
    }
    Log.system.info('下单[终了]');
  }

  destroy() {
    this.trader.end();
  }
}
