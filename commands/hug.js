const { EmbedBuilder } = require('discord.js');

const hugs = [
    'https://i.imgur.com/r9aU2xv.gif',
    'https://i.imgur.com/ntqYLGl.gif',
    'https://i.imgur.com/wOmoeF8.gif',
    'https://i.imgur.com/nrdYNtL.gif',
    'https://i.imgur.com/BPLqSJC.gif'
];

module.exports = {
    name: 'hug',
    description: 'Send a warm hug',
    aliases: ['cuddle'],
    execute(message) {
        const target = message.mentions.users.first();
        const url = hugs[Math.floor(Math.random() * hugs.length)];
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🤗 A warm hug!')
            .setDescription(target ? `${message.author} hugs ${target}!` : `${message.author} sends a hug to everyone!`)
            .setImage(url)
            .setFooter({ text: `Requested by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
};
