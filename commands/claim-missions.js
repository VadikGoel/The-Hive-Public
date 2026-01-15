const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'claim-missions',
    description: 'Claim rewards from completed missions',
    aliases: ['claimmissions', 'claimquests'],
    execute(message, args, db, config) {
        const user = db.createUser(message.author.id, message.guild.id);
        
        // Get claimable missions
        const claimable = db.getClaimableMissions(message.author.id, message.guild.id);

        if (!claimable || claimable.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ No Missions to Claim')
                .setDescription('You haven\'t completed any missions yet!\nUse `/missions` to see what you need to do.')
                .setTimestamp();
            
            return message.reply({ embeds: [embed] });
        }

        // Calculate total reward
        let totalReward = 0;
        let rewardText = '';

        for (const mission of claimable) {
            totalReward += mission.reward;
            rewardText += `✅ ${mission.title}: +${mission.reward} ${config.currency.symbol}\n`;
        }

        // Add coins to user
        db.addCoins(message.author.id, message.guild.id, totalReward);

        // Mark missions as unclaimed
        for (const mission of claimable) {
            const stmt = db.prepare(`
                UPDATE mission_progress SET completedAt = NULL
                WHERE userId = ? AND guildId = ? AND missionId = ?
            `);
            stmt.run(message.author.id, message.guild.id, mission.id);
        }

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('🎉 Missions Claimed!')
            .setDescription(`You completed ${claimable.length} mission(s) today!\n\n${rewardText}`)
            .addFields(
                { name: '💰 Total Earned', value: `${totalReward} ${config.currency.symbol}`, inline: true },
                { name: '🎯 Next', value: `Use \`/missions\` for tomorrow's quests!`, inline: true }
            )
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
