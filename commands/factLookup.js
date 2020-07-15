const {readFile} = require('fs');
module.exports = {
	name: 'factlookup',
	description: 'Looks up facts. Also triggered by !<fact key>. Send just ! to list all the available facts.',
	cooldown: 1000,
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		readFile(`${__dirname}\\facts.json`, (err, facts) => {
			if (err) throw err;
			try{
				facts = JSON.parse(facts);
				let fact = undefined;
				let joinedArgs = args.join(' ').toLowerCase();
				if(args[0] === '') {
					fact = 'There are facts defined for the following keys: ' + Object.keys(facts).join(', ') + '.';
				} else if(facts[joinedArgs] !== undefined) {
					fact = facts[joinedArgs];
				} else if(facts[args[0]] !== undefined) {
					fact = facts[args[0]];
				}
				if(fact !== undefined) origChannel.send(fact);
			} catch (e) {
				throw e;
			}
			
		});
	},
};
