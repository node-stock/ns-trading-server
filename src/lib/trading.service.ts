import { Component } from '@nestjs/common';
import { HttpException } from '@nestjs/core';

import * as types from 'ns-types';
import { OrderManager } from 'ns-manager';
import { Log, Util } from 'ns-common';
import { WebTrader } from 'ns-trader';
import { Bitbank, BitbankApiAsset, BitbankApiOrder } from 'bitbank-handler';
import { BigNumber } from 'BigNumber.js';
import { Store as db } from 'ns-store';

const config = require('config');
db.init(config.store);
Log.init(Log.category.system, Log.level.ALL, 'ns-trading-server');

@Component()
export class TradingService {

  trader: WebTrader;

  constructor() {
    this.trader = new WebTrader(config);
    this.trader.init();
  }

  async order(orderInfo: types.Order) {
    const bitbank = new Bitbank({
      apiKey: config.trader.apiKey,
      apiSecret: config.trader.secret
    });
    try {
      Log.system.info('下单[启动] ', orderInfo);
      let amount = Number(orderInfo.amount);

      if (orderInfo.side === types.OrderSide.Buy) {
        // 买入多单
        if (orderInfo.symbolType === types.SymbolType.cryptocoin) {
          let res: BitbankApiOrder;
          if (orderInfo.backtest !== '1') {
            res = await bitbank.createOrder({
              pair: orderInfo.symbol,
              amount,
              price: Number(orderInfo.price),
              side: types.OrderSide.Buy,
              type: orderInfo.orderType
            }).toPromise();
            Log.system.info('买入多单结果：', JSON.stringify(res, null, 2));
          } else {
            res = {
              order_id: Date.now(),
              pair: orderInfo.symbol,
              side: orderInfo.side,
              type: orderInfo.orderType,
              start_amount: orderInfo.amount,
              remaining_amount: orderInfo.amount,
              executed_amount: orderInfo.amount,
              price: orderInfo.price,
              average_price: orderInfo.price,
              ordered_at: Date.now(),
              status: types.OrderStatus.FullyFilled
            }
            Log.system.info('模拟买入多单结果：', JSON.stringify(res, null, 2));
          }
          // 记录订单
          await this.saveRecord(res, orderInfo);
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

          let res: BitbankApiOrder;
          if (orderInfo.backtest !== '1') {
            res = await bitbank.createOrder({
              pair: orderInfo.symbol,
              amount,
              price: Number(orderInfo.price),
              side: types.OrderSide.Sell,
              type: orderInfo.orderType
            }).toPromise();
            Log.system.info('卖出多单结果：', JSON.stringify(res, null, 2));
          } else {
            res = {
              order_id: Date.now(),
              pair: orderInfo.symbol,
              side: types.OrderSide.Sell,
              type: orderInfo.orderType,
              start_amount: orderInfo.amount,
              remaining_amount: orderInfo.amount,
              executed_amount: orderInfo.amount,
              price: orderInfo.price,
              average_price: orderInfo.price,
              ordered_at: Date.now(),
              status: types.OrderStatus.FullyFilled
            }
            Log.system.info('模拟卖出多单结果：', JSON.stringify(res, null, 2));
          }
          // 记录订单
          await this.saveRecord(res, orderInfo);
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

  async saveRecord(order: BitbankApiOrder, srcOrder: types.Order) {
    const dbOrder: types.Model.Order = {
      id: String(order.order_id),
      account_id: srcOrder.account_id,
      signal_id: srcOrder.signal_id,
      quantity: order.start_amount,
      price: order.price,
      status: types.OrderStatus.Unfilled,
      side: srcOrder.side,
      symbol: order.pair,
      type: srcOrder.symbolType,
      backtest: srcOrder.backtest,
      mocktime: srcOrder.mocktime
    };
    Log.system.info('记录订单信息：', JSON.stringify(order, null, 2));
    // 记录订单信息
    await OrderManager.set(dbOrder);
  }

  async destroy() {
    await db.close();
    await this.trader.end();
  }
}
