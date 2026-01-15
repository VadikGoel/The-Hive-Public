const { EmbedBuilder } = require('discord.js');

// Cooperative heist: risk/reward with simple cooldown per user
const cooldowns = new Map();
const HEIST_COOLDOWN = 3 * 60 * 60 * 1000; // 3 hours

module.exports = {
    name: 'heist',
    description: 'Attempt a risky heist for big rewards',
    aliases: ['raid'],
    execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;
        const key = `${message.guild.id}-${message.author.id}`;
        const now = Date.now();

        const last = cooldowns.get(key) || 0;
        const diff = now - last;
        if (diff < HEIST_COOLDOWN) {
            const endsAtEpoch = Math.floor((last + HEIST_COOLDOWN) / 1000);
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⏳ Heist Cooldown Active')
                .setDescription(`You need to lay low!\nTry again <t:${endsAtEpoch}:R>`) // dynamic relative time
                .addFields({ name: 'Available At', value: `<t:${endsAtEpoch}:T>`, inline: true })
                .setTimestamp();
            
            return message.reply({ embeds: [embed] }).then(m => {
                setTimeout(() => m.delete().catch(() => {}), 10000);
            });
        }

        const user = db.getUser(message.author.id, message.guild.id);
        const stake = Math.min(user?.balance || 0, 500); // stake part of wallet (up to 500) as risk
        const chance = Math.random();

        let resultText;
        let color = '#2ECC71';
        let delta = 0;

        if (chance < 0.15) {
            // jackpot success
            const reward = 3000 + Math.floor(Math.random() * 2000);
            db.addCoins(message.author.id, message.guild.id, reward);
            resultText = `🤑 The heist was a **massive success!** You scored **${reward.toLocaleString()}** ${config.currency.symbol}!`;
            delta = reward;
        } else if (chance < 0.55) {
            // small success
            const reward = 800 + Math.floor(Math.random() * 600);
            db.addCoins(message.author.id, message.guild.id, reward);
            resultText = `✅ You pulled it off! Earned **${reward.toLocaleString()}** ${config.currency.symbol}.`;
            delta = reward;
        } else if (chance < 0.8) {
            // fail but light loss
            const loss = Math.max(100, Math.floor(stake * 0.5));
            db.removeCoins(message.author.id, message.guild.id, loss);
            resultText = `⚠️ Got chased! Lost **${loss.toLocaleString()}** ${config.currency.symbol} while escaping.`;
            color = '#E67E22';
            delta = -loss;
        } else {
            // big fail
            const loss = Math.max(200, Math.floor(stake * 0.8));
            db.removeCoins(message.author.id, message.guild.id, loss);
            resultText = `🚨 Caught! You paid **${loss.toLocaleString()}** ${config.currency.symbol} in fines.`;
            color = '#E74C3C';
            delta = -loss;
        }

        cooldowns.set(key, now);

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('💼 Heist Results')
            .setDescription(resultText)
            .addFields(
                { name: 'Net Gain/Loss', value: `${delta >= 0 ? '▲' : '▼'} ${Math.abs(delta).toLocaleString()} ${config.currency.symbol}`, inline: true },
                { name: 'Cooldown', value: '3h', inline: true },
                { name: 'Tip', value: `Use \`${prefix}daily\` and \`${prefix}weekly\` to rebuild if you lose.`, inline: false }
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
