const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const JOKE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

module.exports = {
    name: 'joke',
    description: 'Get a random joke!',
    aliases: ['dadjoke'],
    async execute(message, args, db, config) {
        const key = `${message.guild.id}-${message.author.id}`;
        const now = Date.now();
        const last = cooldowns.get(key) || 0;
        const diff = now - last;

        if (diff < JOKE_COOLDOWN) {
            const endsAtEpoch = Math.floor((last + JOKE_COOLDOWN) / 1000);
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⏰ Cooldown Active')
                .setDescription(`You're laughing too much right now!\nTry again <t:${endsAtEpoch}:R>`)
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        cooldowns.set(key, now);
        try {
            // Fetch random joke from Official Joke API
            const response = await fetch('https://official-joke-api.appspot.com/random_joke');
            const data = await response.json();

            const jokeText = data.type === 'general' || data.type === 'programming' 
                ? `${data.setup}\n\n||${data.punchline}||` 
                : `${data.setup} ${data.punchline}`;

            const embed = new EmbedBuilder()
                .setColor('#FFD93D')
                .setTitle('😂 Random Joke!')
                .setDescription(`> ${data.setup}\n\n**${data.punchline}**`)
                .addFields({ name: '🎭 Category', value: data.type.charAt(0).toUpperCase() + data.type.slice(1), inline: true })
                .setThumbnail('https://i.imgur.com/qKrYGCt.png')
                .setFooter({ text: `Joke #${data.id} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } catch (error) {
            message.reply('❌ Failed to fetch joke!');
            console.error('Joke command error:', error);
        }
    }
};
