const {Collection} = require('discord.js');
const {writeFileSync} = require('fs');
function extractSnowflake(str){
	if(str.startsWith('<@!')) return str.substring(3, str.length - 1);
	if(str.startsWith('<@')) return str.substring(2, str.length - 1);
	if(str.startsWith('<#')) return str.substring(2, str.length - 1);
	return str;
}
const embedKeys = ['type', 'title', 'description', 'url', 'color', 'fields', 'timestamp', 'thumbnail', 'image', 'video', 'author', 'provider', 'footer'];
const supportedObjects = {
	'user': (origChannel, server, msg, args) => {
		//first, parse users
		let users = msg.mentions.members,
		argUsers = (args.length > 1 ? args.slice(1) : [])
			.filter(user => !user.startsWith('<@!'));//filter out mentions, since those are already handled
		argUsers.forEach(argUser => {
			let membersWithName = server.members.cache.filter(member => member.displayName.toLowerCase() === argUser.toLowerCase() || member.user.username.toLowerCase() === argUser.toLowerCase() || member.id === argUser);
			if(membersWithName.size > 0) users = users.concat(membersWithName);
		});
		users = users.map(user => server.members.fetch(user));
		Promise.all(users).then(users => {
			let userReports = users.map(user => {
				let userData = [];
				if(user.nickname) userData.push({
					name: 'Username',
					value: user.user.username,
					inline: false
				});
				if(user.user.avatar) userData.push({
					name: 'Avatar',
					value: user.user.avatarURL,
					inline: false
				});
				if(user._roles) userData.push({
					name: 'Roles',
					value: user._roles.map(role => server.roles.cache.get(role).name).reverse().join(', '),
					inline: false
				});
				if(user.lastMessage) userData.push({
					name: 'Last Message',
					value: user.lastMessage.content,
					inline: false
				});
				return {
					title: user.displayName,
					thumbnail: {
						url: `https://cdn.discordapp.com/avatars/${user.id}/${user.user.avatar}.png`
					},
					fields: userData
				};
			});
			let reply = `Found ${users.length} matching users` + (users.length > 0?`: ${users.map(member => member.displayName).join(', ')}.`:'.');
			origChannel.send(reply);
			userReports.forEach(report => origChannel.send({embed: report}));
		});
	},
	'channel': (origChannel, server, msg, args) => {
		if(args.length < 2) {
			origChannel.send('Incorrect syntax. Specify a channel.');
			return;
		}
		let channel = args[1];
		if(msg.mentions.channels && msg.mentions.channels.size > 0) {
			channel = msg.mentions.channels.first();
		}
		else {
			if(channel.startsWith('<#')) channel = extractSnowflake(channel);
			channel = server.channels.cache.filter(chan => (chan.id === channel || chan.name.toLowerCase() === channel.toLowerCase()) && chan.type !== 'category').first();
		}
		if(!channel) return origChannel.send('Invalid channel.');
		let chanData = [];
		if(channel.parentID) chanData.push({
			name: 'Category',
			value: channel.parent.name,
			inline: false
		});
		if(channel.topic) chanData.push({
			name: 'Topic',
			value: channel.topic,
			inline: false
		});
		if(channel.lastMessageID) {
			let lastMessage = channel.messages.cache.last();
			if(lastMessage) chanData.push({
				name: 'Last Message',
				value: `${lastMessage.member}: ${lastMessage.content}`,
				inline: false
			});
		}
		origChannel.send({embed: {
			title: `# ${channel.name}`,
			fields: chanData
		}});
	},
	'message': (origChannel, server, msg, args) => {
		if(args.length < 3) {
			origChannel.send('Incorrect syntax. Specify a channel and message id.');
			return;
		}
		let channel = args[1];
		if(msg.mentions.channels && msg.mentions.channels.size > 0) {
			channel = msg.mentions.channels.first();
		}
		else {
			if(channel.startsWith('<#')) channel = extractSnowflake(channel);
			channel = server.channels.cache.filter(chan => (chan.id === channel || chan.name.toLowerCase() === channel.toLowerCase()) && chan.type !== 'category').first();
		}
		if(!channel || !channel.type === 'text') {
			origChannel.send('Invalid or non-text channel.');
			return;
		}
		channel.messages.fetch(args[2]).then(message => {
			let messData = {
				title: `${message.author.tag}'s message in #${channel.name}`,
				fields: []
			};
			if(message.content) messData.description = message.content;
			if(message.attachments.size > 0) messData.fields.push({
				name: 'Attachments',
				value: message.attachments.map(attach => `${attach.filename} (${attach.url})`).join(', '),
				inline: false
			});
			if(message.embeds.length > 0) messData.fields.push({
				name: 'Embeds',
				value: message.embeds.map(emb => {
					let embObj = {};
					for(key of embedKeys) {
						if(emb[key] && key !== 'fields' && key !== 'author') embObj[key] = emb[key];
						if(key === 'fields' && emb.fields.length > 0) embObj.fields = emb.fields.map(field => {
							let fieldObj = {};
							if (field.name) fieldObj.name = field.name;
							if (field.value) fieldObj.value = field.value;
							if (field.inline !== undefined) fieldObj.inline = field.inline;
							return fieldObj;
						});
						if(key === 'author' && emb.author) {
							let authorObj = {};
							if(emb.author.name) authorObj.name = emb.author.name;
							if(emb.author.url) authorObj.url = emb.author.url;
							if(emb.author.iconURL) authorObj.iconURL = emb.author.iconURL;
							embObj.author = authorObj;
						}
						if(key === 'footer' && emb.footer) {
							let footerObj = {};
							if(emb.footer.text) footerObj.text = emb.footer.text;
							if(emb.footer.iconURL) footerObj.iconURL = emb.footer.iconURL;
							if(emb.footer.proxyIconUrl) footerObj.proxyIconUrl = emb.footer.proxyIconUrl;
							embObj.footer = footerObj;
						}
					}
					process.log(embObj);
					return '```' + JSON.stringify(embObj) + '```';
				}).join('\r\n'),
				inline: false
			});
			let longFields = messData.fields.filter(field => field.value.length > 1024);
			messData.fields = messData.fields.filter(field => field.value.length <= 1024);
			let messageObj = {embed: messData};
			if(longFields.length > 0){
				messData.fields.push({
					name: 'Other Fields',
					value: `Other fields removed due to length include ${longFields.map(field => field.name).join(', ')}.`,
					inline: false
				});
				let longFieldsString = longFields.map(field => `${field.name}:\r\n${field.value}`).join('\r\n');
				writeFileSync('commands\\spitfax\\fields.txt', longFieldsString, 'utf8');
				messageObj.files = [{
					attachment: `${__dirname}\\spitfax\\fields.txt`,
					name: `OtherFields.txt`
				}];
			}
			process.log(messageObj);
			origChannel.send(messageObj);
		}).catch(e => {if(e) origChannel.send(e.toString());});
	}
};

module.exports = {
	name: 'spitfax',
	description: 'Returns the object representation of the queried item.',
	cooldown: 1000,
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		if(!args[0] || !Object.keys(supportedObjects).includes(args[0])) {
			origChannel.send('Incorrect syntax. The first argument must be the type of item being looked up. Supported types: ' + Object.keys(supportedObjects).join(', ') + '.');
			return;
		}
		supportedObjects[args[0]](origChannel, server, msg, args);
	},
};
