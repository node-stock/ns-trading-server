import { TradingService } from './trading.service';
import * as assert from 'power-assert';
import * as types from 'ns-types';
import { Store as db, Account } from 'ns-store';

const config = require('config');
const tradingServ = new TradingService();
const testBuy = async () => {
  const order: types.LimitOrder = {
    price: 2197063,
    symbol: 'btc_jpy',
    orderType: types.OrderType.Limit,
    tradeType: types.TradeType.Margin,
    side: types.OrderSide.Buy,
    amount: 0.0001,
    eventType: types.EventType.Order
  };
  await tradingServ.order(order);
}


const testSell = async () => {
  const order: types.LimitOrder = {
    price: 2197063,
    symbol: 'btc_jpy',
    orderType: types.OrderType.Limit,
    tradeType: types.TradeType.Margin,
    side: types.OrderSide.BuyClose,
    amount: 0.00001,
    eventType: types.EventType.Order
  };
  await tradingServ.order(order);
}

describe('TradingService测试', () => {
  before(async () => {
    await db.init(require('config').store);
  });
  it('测试买入', testBuy);
  // it('测试卖出', testSell);
  after(async () => {
    await db.close();
  });
});
