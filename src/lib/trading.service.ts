import { Component } from '@nestjs/common';
import { HttpException } from '@nestjs/core';

import * as types from 'ns-types';
import { OrderManager } from 'ns-manager';
import { Log, Util } from 'ns-common';
import { WebTrader } from 'ns-trader';
import { Bitbank, BitbankApiAsset } from 'bitbank-handler';
import { BigNumber } from 'BigNumber.js';

const config = require('config');
const bitbank = new Bitbank({
  apiKey: config.trader.apiKey,
  apiSecret: config.trader.secret
});
Log.init(Log.category.system, Log.level.ALL, 'ns-trading-server');

@Component()
export class TradingService {

  trader: WebTrader;

  constructor() {
    this.trader = new WebTrader(config);
    this.trader.init();
  }

  async order(accountId: string, orderInfo: types.LimitOrder) {
    try {
      Log.system.info('下单[启动] ', orderInfo);
      let res;
      let amount = Number(orderInfo.amount);
      if (orderInfo.backtest !== '1') {

        if (orderInfo.side === types.OrderSide.Buy) {
          // 买入多单
          if (orderInfo.symbolType === types.SymbolType.cryptocoin) {
            res = await bitbank.createOrder({
              pair: orderInfo.symbol,
              amount,
              price: Number(orderInfo.price),
              side: types.OrderSide.Buy,
              type: orderInfo.orderType
            }).toPromise();
            Log.system.info('买入多单结果：', JSON.stringify(res, null, 2));
          } else {
            await this.trader.buy(orderInfo);
          }
        } else if (orderInfo.side === types.OrderSide.BuyClose) {
          // 卖出多单
          if (orderInfo.symbolType === types.SymbolType.cryptocoin) {
            // 
            const assetsRes = await bitbank.getAssets().toPromise();
            const assetType = Util.getTradeAssetType(orderInfo.symbol);
            const asset = <BitbankApiAsset>assetsRes.assets.find(o => o.asset === assetType);
            const freeAmount = new BigNumber(asset.free_amount);
            const orderAmount = new BigNumber(orderInfo.amount);
            amount = freeAmount.lessThan(orderAmount) ? freeAmount.toNumber() : orderAmount.toNumber();
            res = await bitbank.createOrder({
              pair: orderInfo.symbol,
              amount,
              price: Number(orderInfo.price),
              side: types.OrderSide.Sell,
              type: orderInfo.orderType
            }).toPromise();
            Log.system.info('卖出多单结果：', JSON.stringify(res, null, 2));
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
      }
      if (res['order_id']) {
        const order: types.Model.Order = Object.assign({}, orderInfo, {
          id: res['order_id'],
          account_id: 'coin',
          quantity: orderInfo.amount,
          status: types.OrderStatus.Unfilled,
          type: orderInfo.symbolType
        });
        Log.system.info('记录订单信息：', JSON.stringify(order, null, 2));
        // 记录订单信息
        await OrderManager.set(order);
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
