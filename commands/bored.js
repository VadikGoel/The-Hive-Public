const { EmbedBuilder } = require('discord.js');

const activities = [
    '🎮 Play your favorite game',
    '📚 Read an interesting book',
    '🎵 Listen to some music',
    '🏃 Go for a walk or run',
    '🎨 Create some art',
    '📺 Watch a new movie or series',
    '🍳 Cook something delicious',
    '📸 Take some photos',
    '✍️ Write in a journal',
    '🧘 Meditate or do yoga',
    '🎯 Learn a new skill',
    '📞 Call a friend',
    '🧩 Solve a puzzle',
    '🎪 Try something new',
    '🌳 Spend time in nature',
    '🎭 Watch a comedy special',
    '🎲 Play a board game',
    '💤 Take a relaxing nap',
    '🎤 Sing your heart out',
    '🏋️ Do a quick workout'
];

module.exports = {
    name: 'bored',
    description: 'Get activity suggestions when bored',
    aliases: ['activity', 'dobored'],
    execute(message, args, db, config) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🎯 Feeling Bored?')
            .setDescription(`**Here's something you can do:**\n\n>>> ${activity}`)
            .setThumbnail('https://i.imgur.com/VjKZEGj.png')
            .setFooter({ text: `Suggested for ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
