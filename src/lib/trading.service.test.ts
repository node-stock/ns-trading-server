import { TradingService } from './trading.service';
import * as assert from 'power-assert';
import * as types from 'ns-types';

const config = require('config');
const tradingServ = new TradingService();
const testBuy = async () => {
  const order: types.LimitOrder = {
    price: 2300,
    symbol: 'btc_jpy',
    orderType: types.OrderType.Limit,
    tradeType: types.TradeType.Margin,
    side: types.OrderSide.Buy,
    amount: 0.001,
    eventType: types.EventType.Order
  };
  await tradingServ.order(order);
}


const testSell = async () => {
  const order: types.LimitOrder = {
    price: 91970340,
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
  // it('测试买入', testBuy);
  it('测试卖出', testSell);
});
