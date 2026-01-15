const { EmbedBuilder } = require('discord.js');

const fortunes = [
    '🌟 A pleasant surprise is waiting for you!',
    '🎯 Your hard work will soon pay off!',
    '💫 Good things come to those who wait!',
    '🍀 Luck is on your side today!',
    '✨ Your creativity will shine through!',
    '🎊 Adventure awaits you!',
    '💎 You will find something valuable today!',
    '🌈 A rainbow of opportunities is coming!',
    '⚡ Your energy will inspire others!',
    '🎨 Express yourself and great things will follow!',
    '🏆 Victory is within your reach!',
    '🌸 Beauty surrounds you today!',
    '🔮 The future looks bright!',
    '💝 Love and friendship will find you!',
    '🎪 Fun times are ahead!'
];

module.exports = {
    name: 'fortune',
    description: 'Get your fortune cookie message',
    aliases: ['cookie', 'lucky'],
    execute(message, args, db, config) {
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🥠 Fortune Cookie')
            .setDescription(`**Your fortune:**\n>>> ${fortune}`)
            .setThumbnail('https://i.imgur.com/XK8rQCq.png')
            .setFooter({ text: `${message.author.username}'s fortune • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
