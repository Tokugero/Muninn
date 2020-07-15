require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const botCommands = require('./commands');
let commandAliases = [];

Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].name, botCommands[key]);
	if(botCommands[key].alias !== undefined) commandAliases.push(botCommands[key].alias);
});

const TOKEN = process.env.TOKEN;
const ADMIN = process.env.ADMIN;
const BOT = process.env.BOT;

bot.login(TOKEN);

bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
	const chan = msg.channel.name;
	const author = msg.author.id;
	let args = msg.content.trim().split(/ +/);
	let command = args.shift().toLowerCase();
	
	if(author === bot.user.id) return;
	
	//some messages can trigger the bot to run a command in non-standard ways
	[command, args] = commandAliases.reduce((commandArgs, alias) => alias(...commandArgs), [command, args, msg]);
	
	if (!bot.commands.has(command)) return;
	let botCommand = bot.commands.get(command);
	// for commands that need access to other commands
	if (botCommand.metacommand) args.unshift(bot.commands);
	//whitelists
	if (botCommand.allowedChannels !== undefined && !botCommand.allowedChannels.includes(chan) && chan !== 'console'){
		return;
	}
	if (botCommand.allowedUsers !== undefined && author !== ADMIN){
		let allowedUsers = botCommand.allowedUsers;
		if(Array.isArray(allowedUsers) && !allowedUsers.includes(author)){
			return;
		}
		if(typeof allowedUsers === 'function' && !allowedUsers(args, msg)){
			return;
		}
	}
	console.info(`${msg.author.tag} called command: ${command}${args.length > 0? ' with args ' + args:''}`);
	//cooldown handling
	if(botCommand.cooldown !== undefined) {
		let now = Date.now();
		if(botCommand.lastCall !== undefined && author !== ADMIN){
			let timeSinceLastCall = now - botCommand.lastCall;
			if(timeSinceLastCall < botCommand.cooldown){
				let timeLeft = (botCommand.cooldown - timeSinceLastCall)/1000.0;
				if(timeLeft > 1.0) msg.channel.send(`That command is on cooldown for ${timeLeft.toFixed(1)} seconds.`);
				return;
			}
		} else {
			botCommand.lastCall = now;
		}
	}

	try {
		botCommand.execute(msg, args);
	} catch (error) {
		console.error(error);
		msg.reply(`Error: ${error}`);
	}
});
