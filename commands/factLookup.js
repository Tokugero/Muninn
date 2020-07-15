const {readFile, existsSync} = require('fs');
module.exports = {
	name: 'factlookup',
	description: 'Looks up facts. Also triggered by !<fact key>. Send just ! to list all the available facts.',
	cooldown: 1000,
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		let serverFactsPath = `${__dirname}/facts/${server.id}.json`;
		let globalFactsPath = `${__dirname}/facts/global.json`;
		function handleFact(facts){
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
		}
		readFile(globalFactsPath, (err, globalFacts) => {
			if (err) throw err;
			try {
				globalFacts = JSON.parse(globalFacts);
				if(existsSync(serverFactsPath)){
					readFile(serverFactsPath, (err, serverFacts) => {
						if (err) throw err;
						try {
							serverFacts = JSON.parse(serverFacts);
							let facts = {...globalFacts, ...serverFacts};
							handleFact(facts);
						} catch (e) {
							handleFact(globalFacts);
						}
					});
				} else {
					handleFact(globalFacts);
				}
			} catch (e) {
				origChannel.send(`There is an error in the global facts file: ${e.message}.`);
			}
		});
	},
};
