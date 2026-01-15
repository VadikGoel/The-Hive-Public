const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lottery',
    description: 'Buy a lottery ticket (costs 100 coins)',
    aliases: ['lotto', 'lotterybuy'],
    execute(message, args, db, config) {
        const type = (args[0] || 'daily').toLowerCase();
        
        if (!['daily', 'weekly'].includes(type)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Invalid Lottery Type')
                .setDescription('Use: `/lottery daily` or `/lottery weekly`')
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const result = db.buyLotteryTicket(message.author.id, message.guild.id, type);

        if (!result.success) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Cannot Buy Lottery Ticket')
                .setDescription(result.error)
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const odds = type === 'daily' ? '1 in 10,000' : '1 in 5,000';
        const prize = type === 'daily' ? '1,000' : '5,000';
        const drawTime = type === 'daily' ? 'Daily (Midnight UTC)' : 'Weekly (Monday Midnight UTC)';

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`🎰 ${type.toUpperCase()} Lottery Ticket Purchased!`)
            .setDescription(`Your ticket has been registered. Good luck! 🍀`)
            .setThumbnail('https://media.discordapp.net/attachments/1459907365750182095/1460277690950225925/wmremove-transformed_11.jpeg')
            .addFields(
                { name: 'Ticket ID', value: `\`${result.ticketId.substring(0, 20)}...\``, inline: false },
                { name: 'Ticket Number', value: `\`${result.ticketNumber}\``, inline: true },
                { name: 'Cost', value: `\`100\`\` ${config.currency.symbol}`, inline: true },
                { name: '\u200b', value: '━━━━━━━━━━━━━━━━━━━━━━', inline: false },
                { name: 'Prize Pool', value: `\`${prize}\`\` ${config.currency.symbol}`, inline: true },
                { name: 'Win Odds', value: `\`${odds}\``, inline: true },
                { name: 'Draw Time', value: drawTime, inline: false }
            )
            .setFooter({ text: 'Use /lotto-check to check your tickets • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
