import { Telegraf } from 'telegraf';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const getTradingData = async (func, symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}&interval=1min&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

bot.start((ctx) => ctx.reply('Welcome to the Trading Updates Bot! Use /trade <symbol> to get real-time updates.'));

bot.command('trade', async (ctx) => {
  const [command, symbol] = ctx.message.text.split(' ');
  if (!symbol) {
    return ctx.reply('Please provide a trading symbol. Usage: /trade <symbol>');
  }
  const data = await getTradingData("TIME_SERIES_INTRADAY", symbol);
  if (data['Error Message']) {
    return ctx.reply('Invalid symbol or error fetching data.');
  }

  const timeSeries = data['Time Series (1min)'];
  const latestTime = Object.keys(timeSeries)[0];
  const latestData = timeSeries[latestTime];

  const replyMessage = `
  Symbol: ${symbol}
  Time: ${latestTime}
  Open: ${latestData['1. open']}
  High: ${latestData['2. high']}
  Low: ${latestData['3. low']}
  Close: ${latestData['4. close']}
  Volume: ${latestData['5. volume']}
  `;

  ctx.reply(replyMessage);
});

bot.command('history', async (ctx) => {
  const [command, symbol] = ctx.message.text.split(' ');
  if (!symbol) {
    return ctx.reply('Please provide a trading symbol. Usage: /history <symbol>');
  }
  const data = await getTradingData("HISTORICAL_OPTIONS", symbol);
  if (data['Error Message']) {
    return ctx.reply('Invalid symbol or error fetching data.');
  }

  const key = Object.keys(data)[2];
  const historyData = data[key][0];
  console.log("data", historyData);
  const replyMessage = `
  contractID:  ${historyData.contractID},
  symbol: ${historyData.symbol},
  expiration: ${historyData.expiration},
  strike: ${historyData.strike},
  `
  ctx.reply(replyMessage);
});

bot.launch();

console.log('Bot is running...');
