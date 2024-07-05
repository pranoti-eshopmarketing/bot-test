import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
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

bot.command('check', (ctx) => {
  const message = `
🎉 <b>Welcome to Blink!</b> the future of crypto trading!🚀
Here's why you made the right choice:

<b>1. Revenue-share:</b> 10% of all our fees go to you, our
community. This is dependent on your trading volume and points.

<b>2. User centric Design:</b> Whether you're a beginner or a pro, our bot is tailored to fit all your trading needs.

<b>3. Unmatched Speed, Fees & Security:</b> We optimise trading routes, while keeping your capital safety our top priority.
`;

  ctx.reply(message, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('Create Wallet', 'option_1')],
    ]),
  });
});

bot.command('walletDetails', (ctx) => {
  const message = `
<b>Your wallet details:</b>

💰Balance : 0 SOL

To start trading send some SOL to your Mon3y address

...address....

Once done, tap refresh and your balance will appear here.

<b>How to buy a token?</b>
Simply enter the token symbol or contract address
`;

  ctx.reply(message, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('Buy', 'option_1'),Markup.button.callback('Sell & Manage', 'option_1')],
      [Markup.button.callback('Orders', 'option_1'),Markup.button.callback('🌟My points', 'option_1')],
      [Markup.button.callback('Wallet', 'option_1'),Markup.button.callback('Settings', 'option_1')],
      [Markup.button.callback('Help', 'option_1'),Markup.button.callback('Refer friends', 'option_1')],
      [Markup.button.callback('Refresh', 'option_1')],
    ]),
  });
});

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
