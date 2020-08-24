const {spawn} = require('child_process');

module.exports = {
	name: 'munboot',
	description: 'reboots the bot.',
	allowedChannels: ['console', 'channel2actionnews'],
	allowedUsers: (args, msg, groups) => process.isAdmin(msg.author.id),
	execute(msg, args) {
		const chan = msg.channel;
		spawn(process.argv[0], process.argv.slice(1), {
			detached: true, 
			stdio: 'ignore'
		}).unref();
		chan.send('Rebooting.').then(message => {
			message.client.destroy();
			process.exit();
		});
	},
};
