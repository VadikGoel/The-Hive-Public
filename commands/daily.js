const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward',
    execute(message, args, db, config) {
        const dailyAmount = Math.floor(Math.random() * 200) + 150; // Random 150-350
        const result = db.claimDaily(message.author.id, message.guild.id, dailyAmount);

        if (!result.success) {
            const user = db.getUser(message.author.id, message.guild.id);
            const last = user?.lastDaily ? new Date(user.lastDaily).getTime() : Date.now();
            const endsAtEpoch = Math.floor((last + 24 * 60 * 60 * 1000) / 1000);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⏰ Daily Reward Already Claimed')
                .setDescription(`You've already claimed your daily reward!\nTry again <t:${endsAtEpoch}:R>`) // dynamic relative time
                .addFields({ name: 'Available At', value: `<t:${endsAtEpoch}:T>`, inline: true })
                .setTimestamp();

            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🎁 Daily Reward Claimed!')
            .setDescription(`You received **${dailyAmount}** ${config.currency.symbol} ${config.currency.name}!`)
            .setFooter({ text: 'Come back tomorrow for more! • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        if (config.images?.dailyBannerUrl) {
            embed.setImage(config.images.dailyBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
