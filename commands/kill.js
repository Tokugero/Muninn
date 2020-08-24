module.exports = {
	name: 'munkill',
	description: 'kills the bot.',
	allowedChannels: ['console', 'channel2actionnews'],
	allowedUsers: (args, msg, groups) => process.isAdmin(msg.author.id),
	execute(msg, args) {
		const chan = msg.channel;
		chan.send('Shutting down.').then(message => message.client.destroy());
	},
};
