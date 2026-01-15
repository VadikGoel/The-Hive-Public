const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'dog',
    description: 'Random cute dog picture',
    aliases: ['puppy'],
    async execute(message) {
        try {
            // Fetch dog image from Dog CEO API
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            const url = data.message;

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🐶 Woof!')
                .setImage(url)
                .setFooter({ text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to fetch dog image!');
            console.error('Dog command error:', error);
        }
    }
};
