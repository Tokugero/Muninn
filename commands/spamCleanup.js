module.exports = {
	name: 'munclean',
	description: 'Cleans command and bot spam. Also triggered by munclear, because Victor can\'t remember the actual name half the time.',
	metacommand: true,
	allowedUsers: ['362250920786132993', '293146019238117376', '120006979686105088', '288092789311537153'],
	alias(command, args) {
		if(command === 'munclear') command = 'munclean';
		return [command, args];
	},
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		origChannel.fetchMessages().then(messages => {
			let deletableMessages = messages.filter(message => {
				if(message.author.bot) return true;
				if(message.content.startsWith('!') || message.content.startsWith('<@!718870675921698836>') || message.content.startsWith('<@718870675921698836>') || message.content.toLowerCase().startsWith('munclear')) return true;
				let command = message.content.split(/ +/).shift().toLowerCase();
				return args[0].has(command);
			});
			origChannel.bulkDelete(deletableMessages);
		});
	},
};
