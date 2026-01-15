const { EmbedBuilder } = require('discord.js');

const jobs = [
    { name: 'programmer', min: 30, max: 60 },
    { name: 'chef', min: 25, max: 50 },
    { name: 'teacher', min: 25, max: 55 },
    { name: 'doctor', min: 40, max: 80 },
    { name: 'artist', min: 20, max: 60 },
    { name: 'musician', min: 20, max: 70 },
    { name: 'streamer', min: 15, max: 100 },
    { name: 'youtuber', min: 30, max: 90 }
];

module.exports = {
    name: 'work',
    description: 'Work for coins (15 minute cooldown)',
    async execute(message, args, db, config) {
        const user = db.getUser(message.author.id, message.guild.id);
        const now = Date.now();
        
        // Check cooldown (15 minutes = 900000ms)
        const WORK_COOLDOWN = 900000;
        if (user && user.lastWork) {
            const lastWork = new Date(user.lastWork).getTime();
            const timeSinceWork = now - lastWork;
            
            if (timeSinceWork < WORK_COOLDOWN) {
                const endsAtMs = lastWork + WORK_COOLDOWN;
                const endsAtEpoch = Math.floor(endsAtMs / 1000);

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⏰ Work Cooldown Active')
                    .setDescription(`You're too tired to work right now!\nTry again <t:${endsAtEpoch}:R>`) // dynamic relative time
                    .addFields({ name: 'Cooldown Ends', value: `<t:${endsAtEpoch}:T>`, inline: true })
                    .setTimestamp();

                return message.reply({ embeds: [embed] }).then(m => {
                    setTimeout(() => m.delete().catch(() => {}), 10000);
                });
            }
        }
        
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        let earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

        // Apply coin multiplier if active
        const coinMultiplier = db.getEffectMultiplier(message.author.id, message.guild.id, 'coins');
        earned = Math.floor(earned * coinMultiplier);

        db.addCoins(message.author.id, message.guild.id, earned);
        
        // Update last work time
        const stmt = db.prepare(`UPDATE users SET lastWork = ? WHERE userId = ? AND guildId = ?`);
        stmt.run(new Date().toISOString(), message.author.id, message.guild.id);

        let description = `You worked as a **${job.name}** and earned **${earned}** ${config.currency.symbol} ${config.currency.name}!`;
        if (coinMultiplier > 1) description += `\n💰 **${coinMultiplier}x Coin Multiplier Active!**`;

        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('💼 Work Complete!')
            .setDescription(description)
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        if (config.images?.workBannerUrl) {
            embed.setImage(config.images.workBannerUrl);
        }

        message.reply({ embeds: [embed] });
    }
};
