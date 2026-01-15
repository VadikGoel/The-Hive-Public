const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const DICE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

module.exports = {
    name: 'dice',
    description: 'Roll a dice!',
    aliases: ['roll', 'd6'],
    execute(message, args, db, config) {
        const key = `${message.guild.id}-${message.author.id}`;
        const now = Date.now();
        const last = cooldowns.get(key) || 0;
        const diff = now - last;

        if (diff < DICE_COOLDOWN) {
            const endsAtEpoch = Math.floor((last + DICE_COOLDOWN) / 1000);
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⏰ Cooldown Active')
                .setDescription(`The dice is still rolling!\nTry again <t:${endsAtEpoch}:R>`)
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        cooldowns.set(key, now);
        const sides = parseInt(args[0]) || 6;
        
        if (sides < 2 || sides > 100) {
            return message.reply('Please choose between 2 and 100 sides!');
        }

        const result = Math.floor(Math.random() * sides) + 1;

        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const emoji = sides === 6 ? diceEmojis[result - 1] : '🎲';

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🎲 Rolling Dice...')
            .setDescription('*Rolling...*')
            .setTimestamp();

        message.reply({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
                const resultEmbed = new EmbedBuilder()
                    .setColor('#4ECDC4')
                    .setTitle(`${emoji} Dice Result!`)
                    .setDescription(`# You rolled a **${result}**!`)
                    .addFields({ name: 'Dice Type', value: `D${sides}`, inline: true })
                    .setFooter({ text: `Rolled by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp();

                msg.edit({ embeds: [resultEmbed] });
            }, 1500);
        });
    }
};
