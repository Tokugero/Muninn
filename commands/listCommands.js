module.exports = {
	name: 'listcommands',
	description: 'Lists what commands this user has access to. Also triggered by pinging the bot.',
	metacommand: true,
	alias(command, args) {
		const BOT = process.env.BOT;
		if(command.startsWith(`<@!${BOT}>`) || command.startsWith(`<@${BOT}>`)) return ['listcommands', args];
		return [command, args];
	},
	execute(msg, args) {
		const commands = args[0];
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		const author = msg.member, authorID = msg.member.id;
		let munComms = Array.from(commands.keys());
		let messageContents = commands.filter(comm => {
			let allowedUsers = comm.allowedUsers;
			return (allowedUsers === undefined || allowedUsers.includes(authorID) || authorID === process.env.ADMIN);
		}).map(comm => `${comm.name}: ${comm.description}${comm.allowedChannels? ' Allowed in ' + comm.allowedChannels.join(', ') + '.':''}`).join('\r\n');
		origChannel.send(`${author}, you have access to the following commands:\r\n${messageContents}`)
	},
};
