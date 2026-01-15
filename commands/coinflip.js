const { EmbedBuilder } = require('discord.js');

const cooldowns = new Map();
const COINFLIP_COOLDOWN = 5 * 60 * 1000; // 5 minutes

module.exports = {
    name: 'coinflip',
    description: 'Flip a coin!',
    aliases: ['flip', 'cf'],
    execute(message, args, db, config) {
        const key = `${message.guild.id}-${message.author.id}`;
        const now = Date.now();
        const last = cooldowns.get(key) || 0;
        const diff = now - last;

        if (diff < COINFLIP_COOLDOWN) {
            const endsAtEpoch = Math.floor((last + COINFLIP_COOLDOWN) / 1000);
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⏰ Cooldown Active')
                .setDescription(`The coin is still spinning!\nTry again <t:${endsAtEpoch}:R>`)
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        cooldowns.set(key, now);
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '💿';

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🪙 Coin Flip!')
            .setDescription(`**Flipping...**`)
            .setTimestamp();

        message.reply({ embeds: [embed] }).then(msg => {
            setTimeout(() => {
                const resultEmbed = new EmbedBuilder()
                    .setColor(result === 'Heads' ? '#FFD700' : '#C0C0C0')
                    .setTitle(`${emoji} Coin Landed On...`)
                    .setDescription(`# **${result}!**`)
                    .setFooter({ text: `Flipped by ${message.author.username} • created by VadikGoel (aka VYPER GAMER)`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp();

                msg.edit({ embeds: [resultEmbed] });
            }, 1500);
        });
    }
};
