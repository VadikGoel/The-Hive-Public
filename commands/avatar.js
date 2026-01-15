const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'avatar',
    description: 'Display user\'s avatar',
    aliases: ['av', 'pfp', 'profilepic'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first() || message.author;
        
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`${target.username}'s Avatar`)
            .setDescription(`[Download PNG](${target.displayAvatarURL({ extension: 'png', size: 4096 })}) | [Download JPG](${target.displayAvatarURL({ extension: 'jpg', size: 4096 })}) | [Download WebP](${target.displayAvatarURL({ extension: 'webp', size: 4096 })})`)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
