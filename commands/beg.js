const { EmbedBuilder } = require('discord.js');

const responses = [
    { text: 'A kind stranger gave you', min: 5, max: 25 },
    { text: 'Someone dropped', min: 3, max: 15 },
    { text: 'You found on the ground', min: 5, max: 30 },
    { text: 'A generous person donated', min: 8, max: 35 },
    { text: 'You received from charity', min: 10, max: 20 }
];

module.exports = {
    name: 'beg',
    description: 'Beg for coins',
    execute(message, args, db, config) {
        const response = responses[Math.floor(Math.random() * responses.length)];
        const earned = Math.floor(Math.random() * (response.max - response.min + 1)) + response.min;

        db.addCoins(message.author.id, message.guild.id, earned);

        const embed = new EmbedBuilder()
            .setColor('#ffa500')
            .setTitle('🤲 Begging Results')
            .setDescription(`${response.text} **${earned}** ${config.currency.symbol} ${config.currency.name}!`)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
