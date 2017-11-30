import { NestFactory } from '@nestjs/core';
import { TradingModule } from './lib/Trading.module';

async function bootstrap() {
  const app = await NestFactory.create(TradingModule);
  await app.listen(6060);
}
bootstrap();
