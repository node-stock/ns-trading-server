import { Component } from '@nestjs/common';
import { HttpException } from '@nestjs/core';

import * as types from 'ns-types';
import { Log } from 'ns-common';
import { WebTrader } from 'ns-trader';

const config = require('config');
const bitbank = require('node-bitbankcc');
const priApi = bitbank.privateApi(config.trader.apiKey, config.trader.secret);
Log.init(Log.category.system, Log.level.ALL, 'ns-trading-server');

@Component()
export class TradingService {

  trader: WebTrader;

  constructor() {
    this.trader = new WebTrader(config);
    this.trader.init();
  }

  async order(orderInfo: types.LimitOrder) {
    try {
      Log.system.info('下单[启动] ', orderInfo);
      if (orderInfo.backtest === '1') {
        Log.system.info('测试模式，下单[终了] ');
        return;
      }
      if (orderInfo.side === types.OrderSide.Buy) {
        // 买入多单
        if (orderInfo.symbol.indexOf('_') !== 1) {
          const res = await priApi.order(orderInfo.symbol, orderInfo.price,
            orderInfo.amount, orderInfo.side, orderInfo.orderType);
          Log.system.info('买入多单结果：', JSON.stringify(res));
        } else {
          await this.trader.buy(orderInfo);
        }
      } else if (orderInfo.side === types.OrderSide.BuyClose) {
        // 卖出多单
        if (orderInfo.symbol.indexOf('_') !== 1) {
          const free_amount = Number((await priApi.getAsset())['assets'][1]['free_amount']);
          const amount = free_amount < orderInfo.amount ? free_amount : orderInfo.amount;

          const res = await priApi.order(orderInfo.symbol, orderInfo.price,
            amount, types.OrderSide.Sell, orderInfo.orderType);
          Log.system.info('卖出多单结果：', JSON.stringify(res));
        } else {
          await this.trader.sell(orderInfo);
        }
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
    } catch (e) {
      Log.system.error('下单异常[终了] ', e.stack);
    }
  }

  destroy() {
    this.trader.end();
  }
}
