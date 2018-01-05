import { TradingService } from './trading.service';
import * as assert from 'power-assert';
import * as types from 'ns-types';
import { Store as db, Account } from 'ns-store';
import { BitbankApiOrder } from 'bitbank-handler';

const config = require('config');
const tradingServ = new TradingService();
const testBuy = async () => {
  const order: types.LimitOrder = {
    account_id: 'test',
    price: '1630063',
    symbol: 'btc_jpy',
    symbolType: types.SymbolType.cryptocoin,
    orderType: types.OrderType.Limit,
    tradeType: types.TradeType.Spot,
    side: types.OrderSide.Buy,
    amount: '0.0001',
    eventType: types.EventType.Order,
    backtest: '1'
  };
  await tradingServ.order(order);
}

const testSell = async () => {
  const order: types.LimitOrder = {
    account_id: 'test',
    price: '1680063',
    symbol: 'btc_jpy',
    symbolType: types.SymbolType.cryptocoin,
    orderType: types.OrderType.Limit,
    tradeType: types.TradeType.Spot,
    side: types.OrderSide.BuyClose,
    amount: '0.00001',
    eventType: types.EventType.Order,
    backtest: '1'
  };
  await tradingServ.order(order);
}

const testSaveRecord = async () => {
  const srcOrder: types.Order = {
    account_id: 'test',
    symbol: types.Pair.BTC_JPY,
    price: '1675000',
    amount: '0.00421125',
    symbolType: types.SymbolType.cryptocoin,
    eventType: types.EventType.Order,
    tradeType: types.TradeType.Spot,
    orderType: types.OrderType.Limit,
    side: types.OrderSide.BuyClose,
    backtest: '1'
  };
  const order: BitbankApiOrder = {
    "order_id": 2534449,
    "pair": "bcc_jpy",
    "side": "buy",
    "type": "limit",
    "start_amount": "0.01000000",
    "remaining_amount": "0.01000000",
    "executed_amount": "0.00000000",
    "price": "291856.0000",
    "average_price": "0.0000",
    "ordered_at": 1514893684014,
    "status": "UNFILLED"
  };
  await tradingServ.saveRecord(order, srcOrder);
}

describe('TradingService测试', () => {
  // it('测试买入', testBuy);
  // it('测试卖出', testSell);
  it('测试记录下单', testSaveRecord);
  after(async () => {
    await tradingServ.destroy();
  });
});
