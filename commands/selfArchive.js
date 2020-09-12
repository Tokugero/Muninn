const SevenZ = require('node-7z');
const {MessageAttachment} = require('discord.js');
const {unlink} = require('fs');
const backslash = /\\/g;
const commandDir = __dirname.replace(backslash, '/');
const botDir = commandDir.substring(0, commandDir.lastIndexOf('/'));
const standardOptions = {
	$bin: process.env.SEVENZ,
	workingDir: `${botDir}`,
	recursive: true
};
module.exports = {
	name: 'munarch',
	description: 'Creates and uploads an archive containing this bot\'s source code.',
	allowedChannels: ['console'],
	allowedUsers: (args, msg, groups) => process.isAdmin(msg.author.id),
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
						attachment: `${botDir}/Muninn.7z`,
						name: `Muninn.${frontLoadNum(year)}.${frontLoadNum(month)}.${frontLoadNum(date)}.${frontLoadNum(hours)}.${frontLoadNum(minutes)}.7z`
					}]
				}).catch(e => {
					origChannel.send('Upload failed. See mun-log for details.');
					process.log(e);
				}).then(() => {
					unlink(`${botDir}/Muninn.7z`, (err) => {
						if (err) throw err;
					});
				});
			});
		});
	},
};
