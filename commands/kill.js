module.exports = {
	name: 'munkill',
	description: 'kills the bot.',
	allowedChannels: ['console', 'channel2actionnews'],
	allowedUsers: ['362250920786132993', '293146019238117376'],
	execute(msg, args) {
		const chan = msg.channel;
		chan.send('Shutting down.').then(message => message.client.destroy());
	},
};
