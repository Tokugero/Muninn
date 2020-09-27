# Muninn
Muninn is a Discord bot, incorporating features from other commonly used bots.

## Adding Muninn to a server
Muninn's regular operations assume Muninn has the majority of permissions. For simplicity, use the following link to add Muninn with Administrator permissions.    
https://discord.com/api/oauth2/authorize?client_id=718870675921698836&permissions=8&scope=bot

## Installing Muninn
Clone the repo, run `npm install`.

Create a .env file with the following fields:    
- TOKEN: The token used to sign in to your bot account.    
- ADMIN: The Discord id of the owner's account. The bot automatically responds to all commands from this user, disregarding the usual permissions.    
- AUXADMIN (optional): A secondary ADMIN account.    
- BASESERVER: The Discord id of the bot's main server. This is used to find the log channel.    
- LOGCHANNEL: The Discord id of the channel the bot uses for logging.    
- WHO: A name for your installation of the bot. Used to identify the bot, and to selectively have only one bot instance respond to several commands such as munkill and munboot.    
- SEVENZ: A path to the 7zip executable. Used for uploading files.
