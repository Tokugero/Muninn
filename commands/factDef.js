const {readFile, writeFile, existsSync} = require('fs');
function isAdmin(id){
	return (id === process.env.ADMIN || id === '293146019238117376');
}
module.exports = {
	name: 'factdef',
	description: 'Defines facts for factlookup command.',
	/*allowedUsers: ['362250920786132993', '293146019238117376', '120006979686105088', '288092789311537153', '158423194284457984', '332649893409849349', '162729606145638400'],*/
	alias(command, args, msg) {
		if(command.startsWith('!')){
			if(args.map(arg => arg.toLowerCase()).includes('is')) {
				let override = false;
				args.unshift(command.substring(1));
				if(args[0].toLowerCase() === 'no') {//overriding
					override = true;
					args.shift();
				}
				let isIndex = args.findIndex(arg => arg.toLowerCase() === 'is');
				let key = args.slice(0, isIndex).join(' ');
				args = args.slice(isIndex + 1);
				args.unshift(key);
				if(override) args.unshift('override');
				command = 'factdef';
			} else if(command === '!delete'){
				command = 'factdef';
				args.unshift('delete');
			} else {
				args.unshift(command.substring(1));
				command = 'factlookup';
			}
		}
		return [command, args, msg];
	},
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
			args.shift();
		}
		if(args[0].toLowerCase() === 'global') {
			let author = msg.author.id;
			if(isAdmin(author)){
				args.global = true;
			} else {
				origChannel.send('You do not have permission to change a global fact.');
			}
			args.shift();
		}
		if(args[0].toLowerCase() === '-json') {
			args.JSONparse = true;
			args.shift();
		}
		let factsFile = args.global? 'global':server.id;
		let factsPath = `${__dirname}/facts/${factsFile}.json`;
		function handleFact(factsObj){
			let key = args.shift().toLowerCase();
			if(key === '') return;
			let fact = args.join(' ');
			if(args.JSONparse) {
				try{
					fact = JSON.parse(fact);
				} catch (e) {
					origChannel.send('Invalid format.');
				}
			}
			if (args.deleteFact) {
				fact = factsObj[key];
				let backupKey = `${key} ${args.join(' ')}`
				if(factsObj[backupKey] !== undefined){
					key = backupKey;
					fact = factsObj[backupKey];
				}
				delete factsObj[key];
				origChannel.send(`${key}: ${fact} removed.`);
				writeFile(factsPath, JSON.stringify(factsObj, null, '\t'), 'utf8', (err) => {if(err) throw err;});
			} else if(factsObj[key] === undefined || args.override === true) {
				factsObj[key] = fact;
				origChannel.send(`${key}: ${fact} ${args.override?'changed.':'added.'}`);
				writeFile(factsPath, JSON.stringify(factsObj, null, '\t'), 'utf8', (err) => {if(err) throw err;});
			} else {
				origChannel.send(`${key} already has a fact defined.`);
			}
		}
		if(existsSync(factsPath)){
			readFile(factsPath, (err, facts) => {
				if (err) throw err;
				facts = JSON.parse(facts);
				handleFact(facts);
			});
		} else {
			let facts = {};
			handleFact(facts);
		}
	},
};
