const {initializeBot, loggedIn, handleMessage} = require('./main');

const bot = initializeBot();

const TOKEN = process.env.TOKEN;
delete process.env.TOKEN;
process.bot = bot;

bot.login(TOKEN);

bot.on('ready', loggedIn);

bot.on('message', handleMessage);