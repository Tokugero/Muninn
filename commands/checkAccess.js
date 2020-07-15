module.exports = {
	name: 'muncheck',
	description: 'Simple ping to check if bot can read this channel/respond to this user.',
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		origChannel.send(`I can hear you, ${msg.member}.`);
	},
};
