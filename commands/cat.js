const { EmbedBuilder } = require('discord.js');
const https = require('https');

module.exports = {
    name: 'cat',
    description: 'Random cute cat picture',
    aliases: ['kitty'],
    async execute(message) {
        try {
            // Fetch cat image from The Cat API
            const response = await fetch('https://api.thecatapi.com/v1/images/search');
            const data = await response.json();
            const url = data[0].url;

            const embed = new EmbedBuilder()
                .setColor('#F1C40F')
                .setTitle('🐱 Meow!')
                .setImage(url)
                .setFooter({ text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to fetch cat image!');
            console.error('Cat command error:', error);
        }
    }
};
