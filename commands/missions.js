const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'missions',
    description: 'View your daily missions/quests',
    aliases: ['quests', 'quest'],
    execute(message, args, db, config) {
        const user = db.createUser(message.author.id, message.guild.id);
        
        // Get or create user's unique daily missions
        const missions = db.getOrCreateUserMissions(message.author.id, message.guild.id);

        let missionText = '';
        let totalRewards = 0;
        const completedCount = missions.filter(m => m.completed).length;

        for (let i = 0; i < missions.length; i++) {
            const mission = missions[i];
            const progress = mission.progress || 0;
            const target = mission.target;
            const percent = Math.min(100, Math.floor((progress / target) * 100));
            const isCompleted = mission.completed;

            const progressBar = `${'█'.repeat(Math.floor(percent / 10))}${'░'.repeat(10 - Math.floor(percent / 10))}`;
            const status = isCompleted ? '✅' : '⏳';

            missionText += `\n${i + 1}. ${status} **${mission.title}**\n`;
            missionText += `   ${mission.description}\n`;
            missionText += `   \`${progressBar}\` ${percent}% (${progress}/${target})\n`;
            missionText += `   💰 Reward: ${mission.reward} ${config.currency.symbol}\n`;

            if (isCompleted) {
                totalRewards += mission.reward;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setAuthor({
                name: `${message.author.username}'s Daily Missions`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTitle('🎯 Daily Quests')
            .setDescription(missionText || 'No missions available')
            .addFields(
                { name: '📊 Progress', value: `${completedCount}/3 missions completed`, inline: true },
                { name: '💎 Total Rewards Available', value: `${totalRewards} ${config.currency.symbol}`, inline: true },
                { name: '\u200b', value: `Use \`${config.prefix}claim-missions\` to claim rewards!`, inline: false }
            )
            .setFooter({ text: 'Your missions are unique! Missions reset daily at midnight UTC • created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
