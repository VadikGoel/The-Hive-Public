const { EmbedBuilder } = require('discord.js');

const TAX_RATE = 0.15; // 15% tax on transfers

module.exports = {
    name: 'pay',
    description: 'Pay another user coins (15% tax)',
    aliases: ['transfer', 'give'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target) {
            return message.reply('Please mention a user to pay!');
        }

        if (target.id === message.author.id) {
            return message.reply('You cannot pay yourself!');
        }

        if (target.bot) {
            return message.reply('You cannot pay bots!');
        }

        if (!amount || amount <= 0 || isNaN(amount)) {
            return message.reply('Please specify a valid amount!');
        }

        const sender = db.getUser(message.author.id, message.guild.id);
        const tax = Math.floor(amount * TAX_RATE);
        const totalCost = amount + tax;
        
        if (!sender || sender.balance < totalCost) {
            return message.reply(`You don't have enough ${config.currency.name}! You need ${totalCost} ${config.currency.symbol} (${amount} + ${tax} tax).`);
        }

        // Remove total cost from sender
        db.removeCoins(message.author.id, message.guild.id, totalCost);
        
        // Add only the amount (not tax) to receiver
        db.addCoins(target.id, message.guild.id, amount);

        // Track transfer for missions
        const missions = db.getOrCreateUserMissions(message.author.id, message.guild.id);
        for (const mission of missions) {
            if (mission.missionType === 'transfer' && !mission.completed) {
                db.updateMissionProgress(message.author.id, message.guild.id, mission.id, 1);
                if (mission.progress + 1 >= mission.target) {
                    db.completeMission(message.author.id, message.guild.id, mission.id);
                }
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💸 Transfer Complete')
            .setDescription(`${message.author} paid **${amount}** ${config.currency.symbol} to ${target}!`)
            .addFields(
                { name: 'From', value: message.author.username, inline: true },
                { name: 'To', value: target.username, inline: true },
                { name: 'Amount Sent', value: `${amount} ${config.currency.name}`, inline: true },
                { name: 'Tax (15%)', value: `${tax} ${config.currency.symbol}`, inline: true },
                { name: 'Total Cost', value: `${totalCost} ${config.currency.symbol}`, inline: true }
            )
            .setFooter({ text: '15% tax applied to all transfers • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
