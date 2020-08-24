const Simonrim = '622502918498811907';
const Simon = '120006979686105088';
const usersAllowedToPingSimon = [
	'362250920786132993', //Victor
	'293146019238117376', //Pierre
	'288092789311537153', //paleo
	'120006979686105088', //Simon
	'158423194284457984', //Ricky
	'718870675921698836' //Muninn
];
module.exports = {
	name: 'dontpingsimon',
	description: 'Tells users not to ping Simon.',
	allowedUsers: (args, msg, groups) => false,
	alias(command, args, msg) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(server.id === Simonrim){
			const message = msg.content;
			if(message.includes(`<@!${Simon}>`) || message.includes(`<@${Simon}>`)){
				//pinged simon on simonrim
				if(!usersAllowedToPingSimon.includes(msg.author.id)){
					origChannel.send(`${msg.member} Hi! Do not ping Simon.`);
				}
			}
		}
		return [command, args, msg];
	}
};