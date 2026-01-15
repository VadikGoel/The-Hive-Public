const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rob',
    description: 'Attempt to rob another user!',
    aliases: ['steal'],
    execute(message, args, db, config) {
        const target = message.mentions.users.first();

        if (!target) {
            return message.reply('Please mention a user to rob! Example: `!rob @user`');
        }

        if (target.id === message.author.id) {
            return message.reply('You can\'t rob yourself! 🤦');
        }

        if (target.bot) {
            return message.reply('You can\'t rob bots! They have firewalls! 🤖');
        }

        const robber = db.getUser(message.author.id, message.guild.id);
        const victim = db.getUser(target.id, message.guild.id);

        // Check if victim has rob protection active
        const victimEffects = db.getActiveEffects(target.id, message.guild.id);
        const hasProtection = victimEffects.find(e => e.effectType === 'rob_protection');

        if (hasProtection) {
            return message.reply(`${target.username} has **Rob Protection** active! You can't rob them right now. 🛡️`);
        }

        if (!victim || victim.balance < 100) {
            return message.reply(`${target.username} doesn't have enough coins to rob! They need at least 100 coins.`);
        }

        if (!robber || robber.balance < 200) {
            return message.reply('You need at least 200 coins to attempt a robbery!');
        }

        // 40% chance of success (45% with lucky charm)
        const hasLuckyCharm = db.hasItem(message.author.id, message.guild.id, 'lucky_charm');
        const successRate = hasLuckyCharm ? 0.45 : 0.4;
        const success = Math.random() < successRate;

        if (success) {
            // Steal 20-50% of victim's balance
            const stealPercentage = Math.random() * 0.3 + 0.2;
            const stolen = Math.floor(victim.balance * stealPercentage);

            db.transfer(target.id, message.author.id, message.guild.id, stolen);

            let description = `${message.author} successfully robbed ${target}!`;
            if (hasLuckyCharm) description += '\n🍀 **Lucky Charm Bonus Applied!**';

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('💰 Robbery Successful!')
                .setDescription(description)
                .addFields(
                    { name: '💸 Stolen', value: `${stolen} ${config.currency.symbol}`, inline: true },
                    { name: '🎯 Target', value: target.username, inline: true },
                    { name: '😎 Success Rate', value: `${Math.floor(successRate * 100)}%`, inline: true }
                )
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'You got away with it! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        } else {
            // Failed - pay fine
            const fine = 150;
            db.removeCoins(message.author.id, message.guild.id, fine);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('🚔 Robbery Failed!')
                .setDescription(`${message.author} tried to rob ${target} but got caught!`)
                .addFields(
                    { name: '⚖️ Fine', value: `${fine} ${config.currency.symbol}`, inline: true },
                    { name: '😂 Target', value: target.username, inline: true },
                    { name: '👮 Caught!', value: 'Better luck next time!', inline: true }
                )
                .setThumbnail('https://i.imgur.com/qKKrPvB.png')
                .setFooter({ text: 'You were caught by the police! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        }
    }
};
