const SevenZ = require('node-7z');
const {MessageAttachment} = require('discord.js');
const {unlink} = require('fs');
const botDir = __dirname.substring(0, __dirname.lastIndexOf('\\'));
const standardOptions = {
	$bin: process.env.SEVENZ,
	workingDir: `${botDir}`,
	recursive: true
};
module.exports = {
	name: 'munarch',
	description: 'Creates and uploads an archive containing this bot\'s source code.',
	allowedChannels: ['console'],
	allowedUsers: ['362250920786132993', '293146019238117376', '120006979686105088', '288092789311537153'],
	alias(command, args) {
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
		return [command, args];
	},
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		origChannel.send('Archiving (this may take a second)...');
		SevenZ.add(`Muninn.7z`, '*', standardOptions).once('end', () => {
			SevenZ.delete(`Muninn.7z`, '.env', standardOptions).once('end', () => {
				let now = new Date();
				let year = now.getFullYear() % 2000, month = now.getMonth()+1, date = now.getDate(), hours = now.getHours(), minutes = now.getMinutes();
				let frontLoadNum = (num) => num < 10 ? `0${num}` : `${num}`;
				origChannel.send('This is the currently running version of Muninn.', {
					files: [{
						attachment: `${botDir}\\Muninn.7z`,
						name: `Muninn.${frontLoadNum(year)}.${frontLoadNum(month)}.${frontLoadNum(date)}.${frontLoadNum(hours)}.${frontLoadNum(minutes)}.7z`
					}]
				}).then(() => {
					unlink(`${botDir}\\Muninn.7z`, (err) => {
						if (err) throw err;
					});
				});
			});
		});
	},
};
