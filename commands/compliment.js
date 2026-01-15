const { EmbedBuilder } = require('discord.js');

const compliments = [
    'You\'re an awesome person! 🌟',
    'Your smile is contagious! 😊',
    'You bring out the best in people! 💖',
    'You\'re a great friend! 🤗',
    'You light up the room! ✨',
    'You\'re incredibly talented! 🎨',
    'Your kindness is inspiring! 💫',
    'You make the world a better place! 🌍',
    'You\'re absolutely amazing! 🎉',
    'Your creativity knows no bounds! 🚀',
    'You\'re one of a kind! 💎',
    'You have a great sense of humor! 😄',
    'You\'re stronger than you know! 💪',
    'Your positive energy is infectious! ⚡',
    'You\'re a true gem! 💝',
    'You make everything more fun! 🎊',
    'You\'re doing great! Keep it up! 🏆',
    'You\'re beautiful inside and out! 🌸',
    'You have impeccable taste! 👌',
    'You\'re a ray of sunshine! ☀️'
];

module.exports = {
    name: 'compliment',
    description: 'Get a random compliment',
    aliases: ['comp', 'nice'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first() || message.author;
        const compliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('💝 Compliment')
            .setDescription(`${target}, ${compliment}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Spread positivity! 💖 • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
