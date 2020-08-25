const {loggedIn, handleMessage} = require('./main');
const Discord = require('discord.js');
const bot = new Discord.Client();

bot.commands = new Discord.Collection();
bot.commandAliases = [];
const botCommands = require('./commands');
Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].name, botCommands[key]);
	if(botCommands[key].alias !== undefined) bot.commandAliases.push(botCommands[key].alias);
});

const TOKEN = process.env.TOKEN;
delete process.env.TOKEN;
process.env.WHO = 'dev';
process.bot = bot;

bot.login(TOKEN);

bot.on('ready', loggedIn);

bot.on('message', (msg) => (msg.author.id === process.env.ADMIN && msg.channel.name === 'console')? handleMessage(msg): undefined);