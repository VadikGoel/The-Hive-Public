const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'weekly',
    description: 'Claim your weekly reward',
    aliases: ['week'],
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;
        const amount = Math.floor(Math.random() * 800) + 600; // Random 600-1400

        const result = db.claimWeekly(message.author.id, message.guild.id, amount);

        if (!result.success) {
            const user = db.getUser(message.author.id, message.guild.id);
            const last = user?.lastWeekly ? new Date(user.lastWeekly).getTime() : Date.now();
            const endsAtEpoch = Math.floor((last + 7 * 24 * 60 * 60 * 1000) / 1000);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⏰ Weekly Reward Already Claimed')
                .setDescription(`You've already claimed your weekly reward!\nTry again <t:${endsAtEpoch}:R>`) // dynamic relative time
                .addFields({ name: 'Available At', value: `<t:${endsAtEpoch}:T>`, inline: true })
                .setTimestamp();

            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('🎁 Weekly Reward Claimed!')
            .setDescription(`You received **${amount.toLocaleString()}** ${config.currency.symbol} ${config.currency.name}!`)
            .setFooter({ text: `Use ${prefix}daily for your daily reward! • created by VadikGoel (aka VYPER GAMER)` })
            .setTimestamp();

        if (config.images?.weeklyBannerUrl) {
            embed.setImage(config.images.weeklyBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
