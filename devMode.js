const {initializeBot, loggedIn, handleMessage} = require('./main');

const bot = initializeBot();

const TOKEN = process.env.TOKEN;
delete process.env.TOKEN;
process.env.WHO = 'dev';
process.bot = bot;

bot.login(TOKEN);

bot.on('ready', loggedIn);

bot.on('message', (msg) => (msg.author.id === process.env.ADMIN && msg.channel.name === 'console')? handleMessage(msg): undefined);