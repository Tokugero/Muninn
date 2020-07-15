const Discord = require('discord.js');

module.exports = {
	name: 'raffle',
	description: 'Rolls raffle winers. Will list all possible winners unless a limiting number is given.',
	allowedChannels: ['console'],
	allowedUsers: ['362250920786132993', '293146019238117376', '120006979686105088', '288092789311537153'],
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		const raffleChannel = server.channels.find(channel => channel.name === 'premium-raffle');
		raffleChannel.fetchMessages({limit: 100})
			.then(messages => {
				messages = messages.filter(message => message.content.toLowerCase().includes('react to this message'))
					.filter(message => message.reactions.size > 0);
				let reactions = messages.map(message => message.reactions.array()).flat();
				let users = reactions.map(react => react.fetchUsers(react.count));
				Promise.all(users).then(usersArray => {
					let users = usersArray.shift();
					if(usersArray.length > 0) users = users.concat(...usersArray);
					users = users.map(user => server.member(user)).filter(user => user);
					for(let i = users.length; i > 0;) {
						let randomIndex = Math.floor(Math.random() * i);
						i -= 1;
						let temp = users[i];
						users[i] = users[randomIndex];
						users[randomIndex] = temp;
					}
					let maxUsers = parseInt(args[0]) || users.length;
					if(users.length > maxUsers) users = users.slice(0, maxUsers);
					origChannel.send(`Found users:\r\n${users.map(user => user.displayName).join('\r\n')}`);
				});
			});
	},
};
