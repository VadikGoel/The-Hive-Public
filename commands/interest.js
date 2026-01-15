const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interest',
    description: 'Claim your monthly bank interest (2-5%)',
    execute(message, args, db, config) {
        const user = db.createUser(message.author.id, message.guild.id);
        const result = db.claimInterest(message.author.id, message.guild.id);

        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Cannot Claim Interest')
                .setDescription(result.error)
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            if (result.daysLeft) {
                embed.addFields({
                    name: 'Available In',
                    value: `\`${result.daysLeft} days\``
                });
            }

            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💰 Interest Claimed!')
            .setDescription('Your monthly bank interest has been added to your wallet.')
            .addFields(
                { name: 'Interest Rate', value: `\`${result.rate.toFixed(1)}%\``, inline: true },
                { name: 'Amount Received', value: `\`${result.amount}\`\` ${config.currency.symbol}`, inline: true },
                { name: 'Bank Balance', value: `\`${user.bank}\`\` ${config.currency.symbol}`, inline: true }
            )
            .setFooter({ text: 'Next interest available in 30 days • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
