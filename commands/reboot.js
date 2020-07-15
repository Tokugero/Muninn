const {spawn} = require('child_process');

module.exports = {
	name: 'munboot',
	description: 'reboots the bot.',
	allowedChannels: ['console', 'channel2actionnews'],
	allowedUsers: ['362250920786132993', '293146019238117376', '120006979686105088', '288092789311537153'],
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
