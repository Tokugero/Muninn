const fs = require('fs');
const settings = require('./serverSettings');
const requires = Object.fromEntries(Object.keys(require('./scriptRequirements')).map(key => [key, require(require('./scriptRequirements')[key])]));;
const argDef = (level) => `msg,args${level === 0? ',requires': ''}`; //level 0 scripts can have access to other modules
let rawScriptsArray = require('./scripts');

let scripts = {
	'new': {
		level: 0,
		exec(msg, args){
			const origChannel = msg.channel;
			if(args.length === 0) {
				origChannel.send('Name required for new function.');
				return;
			}
			let name = args.shift().toLowerCase();
			if(args.length === 0) {
				origChannel.send('Body required for new function.');
				return;
			}
			if(name in scripts) {
				origChannel.send(`${name} already has a script defined.`);
			}
			let level = isNaN(parseInt(args[0]))? 0 : parseInt(args.shift());
			if(args.length === 0) {
				origChannel.send('Body required for new function.');
				return;
			}
			let body = args.join(' ');
			scripts[name] = {level, exec: new Function(argdef(level), body)};
			origChannel.send(`${name} added.`);
			rawScriptsArray.push({name, level, body});
			fs.promises.writeFile('commands/scripts.json', JSON.stringify(rawScriptsArray, null, '\t'), 'utf8')
			.then(() => origChannel.send('Scripts updated.'))
			.catch((e) => origChannel.send('Error encountered. Update failed.')
				.then(() => process.log(e)));
		}
	}
};
rawScriptsArray.forEach(script => {
	let name = script.name.toLowerCase();
	scripts[name] = {
		level: script.level !== undefined ? script.level: -1,
		exec: new Function(argDef(script.level), script.body)
	};
});
const securityLevels = [ // ascending security
	(member) => process.isAdmin(member.id), //bot admin only
	(member) => settings.isAllowedToSet(member.guild, settings.ADMIN, member), //server admin+ only only
	(member) => settings.isAllowedToSet(member.guild, settings.MODERATORS, member), //moderators+ only
	(member) => settings.isAllowedToSet(member.guild, settings.HAS_BOT_ACCESS, member) //all users with bot access
];

module.exports = {
	name: 'munscript',
	description: 'Runs scripts that are not large enough to qualify as full commands.',
	alias(command, args, msg) {
		if(command.startsWith('$')){
			args.unshift(command.substring(1));
			command = 'munscript';
		}
		return [command, args, msg];
	},
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		let scriptName = args.shift().toLowerCase();
		if(scriptName in scripts) {
			let script = scripts[scriptName];
			let isAllowed = (script.level < 0 //script access never defined
				|| script.level >= securityLevels.length)? //script is even more accessible than I've bothered restricting
				true: securityLevels[script.level](msg.member);
			if(isAllowed){
				scripts[scriptName].exec(msg, args, requires);
			} else {
				origChannel.send('You do not have access to that script.');
			}
		}
	},
};