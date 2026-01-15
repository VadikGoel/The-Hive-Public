const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'fight',
    description: 'Battle another user for coins!',
    execute(message, args, db, config) {
        const target = message.mentions.users.first();
        const bet = parseInt(args[1]);

        if (!target) {
            return message.reply(`Challenge someone to a fight! Example: \`${config.prefix}fight @user 200\``);
        }

        if (target.id === message.author.id) {
            return message.reply('You cannot fight yourself!');
        }

        if (target.bot) {
            return message.reply('You cannot fight bots!');
        }

        if (!bet || bet <= 0 || isNaN(bet)) {
            return message.reply('Please specify a valid bet amount!');
        }

        const challenger = db.getUser(message.author.id, message.guild.id);
        const opponent = db.getUser(target.id, message.guild.id);

        if (!challenger || challenger.balance < bet) {
            return message.reply(`You don't have enough ${config.currency.name}!`);
        }

        if (!opponent || opponent.balance < bet) {
            return message.reply(`${target.username} doesn't have enough ${config.currency.name}!`);
        }

        // Combat simulation - each fighter has health
        const fighter1 = {
            name: message.author.username,
            health: 100,
            id: message.author.id
        };

        const fighter2 = {
            name: target.username,
            health: 100,
            id: target.id
        };

        const combatLog = [];
        const moves = ['Punch', 'Kick', 'Dodge', 'Block', 'Headbutt', 'Sweep'];

        while (fighter1.health > 0 && fighter2.health > 0) {
            // Fighter 1 attacks
            const move1 = moves[Math.floor(Math.random() * moves.length)];
            const damage1 = Math.floor(Math.random() * 25) + 10;
            
            if (move1 !== 'Dodge' && move1 !== 'Block') {
                fighter2.health = Math.max(0, fighter2.health - damage1);
                combatLog.push(`${fighter1.name} ${move1} - ${damage1} dmg!`);
            } else {
                combatLog.push(`${fighter1.name} ${move1}!`);
            }

            if (fighter2.health <= 0) break;

            // Fighter 2 attacks
            const move2 = moves[Math.floor(Math.random() * moves.length)];
            const damage2 = Math.floor(Math.random() * 25) + 10;
            
            if (move2 !== 'Dodge' && move2 !== 'Block') {
                fighter1.health = Math.max(0, fighter1.health - damage2);
                combatLog.push(`${fighter2.name} ${move2} - ${damage2} dmg!`);
            } else {
                combatLog.push(`${fighter2.name} ${move2}!`);
            }
        }

        const winner = fighter1.health > 0 ? fighter1 : fighter2;
        const loser = fighter1.health > 0 ? fighter2 : fighter1;

        // Process payment
        db.removeCoins(fighter1.id, message.guild.id, bet);
        db.removeCoins(fighter2.id, message.guild.id, bet);
        db.addCoins(winner.id, message.guild.id, bet * 2);

        // Build combat report
        let report = combatLog.slice(0, 5).join('\n');
        if (combatLog.length > 5) {
            report += `\n... and ${combatLog.length - 5} more moves!`;
        }

        const embed = new EmbedBuilder()
            .setColor(winner.name === message.author.username ? '#00ff00' : '#ff6b6b')
            .setTitle('⚔️ FIGHT RESULT')
            .setDescription(`🏆 **${winner.name}** wins the battle!\n\n**Combat Log:**\n\`\`\`\n${report}\n\`\`\``)
            .addFields(
                { name: `${fighter1.name} HP`, value: `${Math.max(0, fighter1.health)}/100`, inline: true },
                { name: `${fighter2.name} HP`, value: `${Math.max(0, fighter2.health)}/100`, inline: true },
                { name: '💰 Prize', value: `${winner.name} won ${bet * 2} ${config.currency.symbol}!`, inline: false }
            )
            .setTimestamp();

        // Send to casino channel if set
        if (guildSettings.casinoChannelId) {
            const casinoChannel = message.guild.channels.cache.get(guildSettings.casinoChannelId);
            if (casinoChannel) {
                casinoChannel.send({ embeds: [embed] });
            } else {
                message.reply({ embeds: [embed] });
            }
        } else {
            message.reply({ embeds: [embed] });
        }
    }
};
