const {readFile, writeFile} = require('fs');
module.exports = {
	name: 'factdef',
	description: 'Defines facts for factlookup command.',
	allowedUsers: ['362250920786132993', '293146019238117376', '120006979686105088', '288092789311537153', '158423194284457984', '332649893409849349', '162729606145638400'],
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		if(args[0].toLowerCase() === 'delete') {
			args.deleteFact = true;
			args.shift();
		}
		if(args[0].toLowerCase() === 'override') {
			args.override = true;
			argsm.shift();
		}
		readFile(`${__dirname}\\facts.json`, (err, facts) => {
			if (err) throw err;
			facts = JSON.parse(facts);
			let key = args.shift().toLowerCase();
			let fact = args.join(' ');
			if (args.deleteFact) {
				fact = facts[key];
				let backupKey = `${key} ${args.join(' ')}`
				if(facts[backupKey] !== undefined){
					key = backupKey;
					fact = facts[backupKey];
				}
				delete facts[key];
				origChannel.send(`${key}: ${fact} removed.`);
				writeFile(`${__dirname}\\facts.json`, JSON.stringify(facts, null, '\t'), 'utf8', (err) => {if(err) throw err;});
			} else if(facts[key] === undefined || args.override === true) {
				facts[key] = fact;
				origChannel.send(`${key}: ${fact} ${args.override?'changed.':'added.'}`);
				writeFile(`${__dirname}\\facts.json`, JSON.stringify(facts, null, '\t'), 'utf8', (err) => {if(err) throw err;});
			} else {
				origChannel.send(`${key} already has a fact defined.`);
			}
		});
	},
};
