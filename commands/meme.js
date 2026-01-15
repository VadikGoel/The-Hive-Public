const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'meme',
    description: 'Get a random meme!',
    aliases: ['memes'],
    async execute(message, args, db, config) {
        try {
            // Fetch meme from Meme API
            const response = await fetch('https://meme-api.com/gimme');
            const data = await response.json();

            // Skip NSFW memes
            if (data.nsfw) {
                return message.reply('⚠️ Skipped NSFW meme. Try again!');
            }

            const embed = new EmbedBuilder()
                .setColor('#FF6B9D')
                .setTitle(`😆 ${data.title}`)
                .setImage(data.url)
                .addFields(
                    { name: '📊 Subreddit', value: `r/${data.subreddit}`, inline: true },
                    { name: '👍 Upvotes', value: data.ups.toString(), inline: true }
                )
                .setFooter({ 
                    text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, 
                    iconURL: message.author.displayAvatarURL() 
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to fetch meme!');
            console.error('Meme command error:', error);
        }
    }
};
