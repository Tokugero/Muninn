const message = `Some records in Simon's mods may appear incorrect in xEdit, but are actually intentional edits that work correctly in-game.
The most commonly reported one is 0 magnitude effects on racial passives. This is intentional. Directly buffing enemy health with an ability causes a vanilla bug that stops their health bar from going down. Instead, this change is implemented at the race level to avoid the bug.
If race edits do not appear to be working in your game, you have another mod installed that is changing the races, and the conflict is preventing Aetherius from working. Many mods you would not expect to change race records do. Please confirm that there are no conflicts in xEdit.
Any ITMs in Arena are intentional and should not be removed. The purpose of these ITMs is to make sure that all of the dungeons are consistent with Arena's rules, even if the vanilla settings are the same. Removing these will at best do nothing at all, or cause difficulty spikes.
Edits to base cost of armor spells are intentional. They do not produce an in-game effect, but are there to keep vanilla visuals for consistency. If you want to change to the scale visuals, there is an optional plugin on the Mysticism mod page.

These are not bugs. Please do not report them as such.`;

module.exports = {
	name: 'notabug',
	description: 'Reply to common bugs.',
	allowedChannels: ['support'],
	cooldown: 60000,
	execute(msg, args) {
		const origChannel = msg.channel;
		const server = origChannel.guild;
		if(!server.available) return;
		origChannel.send(message);
	},
};
