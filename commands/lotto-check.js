const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lotto-check',
    description: 'Check your lottery tickets',
    aliases: ['lottocheck', 'checkticket'],
    execute(message, args, db, config) {
        const type = args[0] ? args[0].toLowerCase() : null;

        if (type && !['daily', 'weekly'].includes(type)) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Invalid Type')
                .setDescription('Use: `/lotto-check` or `/lotto-check daily` or `/lotto-check weekly`')
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const tickets = db.getLotteryTicketsForUser(message.author.id, message.guild.id, type);

        if (tickets.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🎰 No Lottery Tickets')
                .setDescription('You haven\'t bought any lottery tickets yet!')
                .setFooter({ text: 'Use /lottery to buy a ticket • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle(`🎰 Your Lottery Tickets${type ? ` (${type.toUpperCase()})` : ''}`)
            .setThumbnail('https://media.discordapp.net/attachments/1459907365750182095/1460277690950225925/wmremove-transformed_11.jpeg')
            .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        let wonTickets = 0;
        let wonAmount = 0;
        let activeTickets = 0;

        for (const ticket of tickets) {
            if (ticket.wonAmount) {
                wonTickets++;
                wonAmount += ticket.wonAmount;
                embed.addFields({
                    name: `✅ WINNER! ${ticket.type.toUpperCase()}`,
                    value: `Number: \`${ticket.number}\` | Won: \`${ticket.wonAmount}\`\` ${config.currency.symbol} | <t:${Math.floor(new Date(ticket.wonAt).getTime() / 1000)}:R>`,
                    inline: false
                });
            } else {
                activeTickets++;
                embed.addFields({
                    name: `🎟️ ${ticket.type.toUpperCase()} Ticket`,
                    value: `Number: \`${ticket.number}\` | Bought: <t:${Math.floor(new Date(ticket.boughtAt).getTime() / 1000)}:R>`,
                    inline: false
                });
            }
        }

        if (wonTickets > 0) {
            embed.addFields({
                name: '\u200b',
                value: `━━━━━━━━━━━━━━━━━━━━━━`,
                inline: false
            });
            embed.addFields({
                name: '🎉 WINNINGS SUMMARY',
                value: `Won ${wonTickets} ticket(s) for a total of \`${wonAmount}\`\` ${config.currency.symbol}`,
                inline: false
            });
        }

        embed.addFields({
            name: 'Summary',
            value: `Active: ${activeTickets} | Won: ${wonTickets}`,
            inline: true
        });

        message.reply({ embeds: [embed] });
    }
};
