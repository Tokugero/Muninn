const fs = require('fs');
const Discord = require('discord.js');
function isMention(str){
	if(str.startsWith('<@!') && str.endsWith('>')) return 'user';
	if(str.startsWith('<@&') && str.endsWith('>')) return 'role';
	if(str.startsWith('<@') && str.endsWith('>')) return 'user';
	if(str.startsWith('<#') && str.endsWith('>')) return 'channel';
	return false;
}
function extractSnowflake(str){
	if(str.startsWith('<@!')) return str.substring(3, str.length - 1);
	if(str.startsWith('<@&')) return str.substring(3, str.length - 1);
	if(str.startsWith('<@')) return str.substring(2, str.length - 1);
	if(str.startsWith('<#')) return str.substring(2, str.length - 1);
	return str;
}
function parseArgs(server, args){
	let users = args.filter(arg => isMention(arg) === 'user').map(arg => extractSnowflake(arg));
	let roles = args.filter(arg => isMention(arg) === 'role').map(arg => extractSnowflake(arg));
	let channels = args.filter(arg => isMention(arg) === 'channel').map(arg => extractSnowflake(arg));
	let serverUsers = server.members.map(member => {
		return {
			id: member.id,
			username: member.user.username.toLowerCase(),
			tag: member.user.tag.toLowerCase(),
			displayname:  member.displayName.toLowerCase()
		};
	});
	let others = args.filter(arg => !isMention(arg)).map(arg => {
		let larg = arg.toLowerCase();
		let user = server.members.has(arg)? server.members.get(arg) :
			serverUsers.find(obj => larg === obj.username || larg === obj.tag || larg === obj.displayname);
		if(user) {
			users.push(user.id);
			return 0;
		}
		let role = server.roles.has(arg)? server.roles.get(arg) :
			server.roles.find(role => role.name.toLowerCase() === larg);
		if(role) {
			roles.push(role.id);
			return 0;
		}
		let channel = server.channels.has(arg)? server.channels.get(arg) :
			server.channels.find(channel => channel.name.toLowerCase() === larg);
		if(channel) {
			channels.push(channel.id);
		}
		return arg;
	}).filter(arg => arg !== 0);
	return {users, roles, channels, others};
}

process.serverSettings = new Discord.Collection();
let settingsFiles = fs.promises.readdir('./commands/settings', {encoding: 'utf8', withFileTypes: true})
	.then(dir => dir.filter(dirent => dirent.isFile())
		.map(dirent => dirent.name)
		.map(filename => fs.promises.readFile(`./commands/settings/${filename}`, 'utf8')
			.then(file => {
				try{
					let settings = JSON.parse(file);
					let server = settings['_server'];
					delete settings['_server'];
					process.serverSettings.set(server, settings);
					return server;
				} catch(e) {
					console.log(e);
					return "";
				}
			}))
	).then(files => Promise.all(files))
	.then(settings => console.log(`Server settings loaded.`))
	.catch(e => console.log(e));

const supportedSettings = {
	'serverAdmin': {
		help: '',
		allowedToSet: (server, authorID, rolesID) => {
			let settings = process.serverSettings.has(server.id)? process.serverSettings.get(server.id) : undefined;
			let authorInAdmin = settings.serverAdmin !== undefined && (settings.serverAdmin.includes(authorID) || authorRoles.some(role => settings.serverAdmin.includes(role)));
			return (process.isAdmin(authorID) || server.ownerID === authorID || authorInAdmin);
		},
		set: (settings, argsObject, initialValue) => {
			if(initialValue === undefined || !Array.isArray(initialValue)) initialValue = [];
			let {users, roles} = argsObject;
			users = users.filter(user => !initialValue.includes(user));
			roles = roles.filter(role => !initialValue.includes(role));
			settings.serverAdmin = initialValue.concat([...users, ...roles]);
		},
		rejectChange: '`serverAdmin` can only be set by bot administrator, the server owner, or current server admin. Settings not changed.'
	},
	'moderator': {
		help: '',
		allowedToSet: (server, authorID, rolesID) => {
			let settings = process.serverSettings.has(server.id)? process.serverSettings.get(server.id) : undefined;
			let authorInAdmin = settings.serverAdmin !== undefined && (settings.serverAdmin.includes(authorID) || authorRoles.some(role => settings.serverAdmin.includes(role)));
			return (process.isAdmin(authorID) || server.ownerID === authorID || authorInAdmin);
		},
		set: (settings, argsObject, initialValue) => {
			if(initialValue === undefined || !Array.isArray(initialValue)) initialValue = [];
			let {users, roles} = argsObject;
			users = users.filter(user => !initialValue.includes(user));
			roles = roles.filter(role => !initialValue.includes(role));
			settings.moderator = initialValue.concat([...users, ...roles]);
		},
		rejectChange: '`moderator` can only be set by bot administrator, the server owner, or current server admin. Settings not changed.'
	}
};
const settingsNames = Object.keys(supportedSettings);
const flags = ['-help', '-init'];
const help = '`munset -help`';

function writeSettings(server, logChannel){
	let settings = process.serverSettings.get(server.id);
	settings = Object.assign({}, settings);
	settings['_server'] = server.id;
	fs.promises.writeFile(`${__dirname}/settings/${server.id}.json`, JSON.stringify(settings, null, '\t'), 'utf8').then(() => logChannel.send('Settings saved.')).catch(() => logChannel.send('Settings failed to save.'));
}

module.exports = {
	name: 'munset',
	description: `Set Muninn's server specific variables with this command. Use ${help} for more information.`,
	allowedChannels: ['console'],
	allowedUsers: ['745378744079876188'],
	execute(msg, args){
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		let hasSettings = process.serverSettings.has(server.id);
		let settings = hasSettings? process.serverSettings.get(server.id) : undefined;
		if(args.length === 0){
			let message = 'Supported settings:\r\n' + settingsNames.join(', ');
			if(!hasSettings) message += '\r\nThis server has no settings defined. You can use `munset -init` to initialize your settings, and `munset -help` for more information on this command.';
			if(hasSettings) {
				let definedSettings = settingsNames.filter(name => name in settings).map(name => `${name}: ${settings[name].map(setting => server.roles.has(setting)? server.roles.get(setting): server.members.get(setting)).join(', ')}`);
				message += `\r\n${definedSettings.join(', ')}`;
			}
			origChannel.send(message);
			return;
		}
		if(args[0].toLowerCase() === '-help') {
			args.shift();
			if(args.length === 0){
				let message = 'Valid syntax for this command is `munset [flags] <setting> <user or role>`. For example,';
				message += `\r\nmunset serverAdmin ${msg.member}\r\n`
				message += 'This command supports several additional flags.\r\n`-init` will automatically make the server owner the serverAdmin and fill moderator with a role named moderator, if there is one. Other settings will not be given a default value.';
				origChannel.send(message);
				return;
			} else {
				let setting = args.shift().toLowerCase();
				setting = settingsNames.find(name => name.toLowerCase() === setting);
				if(setting !== undefined) {
					origChannel.send(`${setting}: ${supportedSettings[setting].help}`);
					return;
				}
			}
		}
		if(args[0].toLowerCase() === '-init') {
			if(settings === undefined) {
				settings = {};
				process.serverSettings.set(server.id, settings);
			}
			settings.serverAdmin = [server.ownerID];
			let moderator = server.roles.find(role => role.name.toLowerCase() === 'moderator');
			if(moderator !== null) settings.moderator = [moderator];
			writeSettings(server, origChannel);
			return;
		}
		if(settingsNames.map(name => name.toLowerCase()).includes(args[0].toLowerCase())){
			let setting = args.shift().toLowerCase();
			setting = settingsNames.find(name => name.toLowerCase() === setting);
			if(args.length === 0 && setting !== undefined) {
				origChannel.send(`${setting}: ${settings[setting].join(', ')}`);
				return;
			}
			if(setting !== undefined){
				let settingDef = supportedSettings[setting];
				let authorID = msg.author.id;
				let authorRoles = msg.member.roles.keyArray();
				if(settingDef.allowedToSet(server, authorID, authorRoles)){
					settingDef.set(settings, parseArgs(server, args));
					origChannel.send(`New ${setting}: ${settings[setting].join(', ')}`);
					writeSettings(server, origChannel);
					return;
				} else {
					origChannel.send(settingDef.rejectChange);
					return;
				}
			}
		}
	}
};