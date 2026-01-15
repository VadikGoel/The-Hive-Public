const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'levelroles',
    description: 'Configure role rewards for reaching specific levels (Admin only)',
    aliases: ['levelrole', 'rolerewards'],
    async execute(message, args, db, config) {
        // Check admin permission
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission to use this command!');
        }

        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;
        
        const subcommand = message.slashOptions?.action || args[0]?.toLowerCase();
        const levelArg = message.slashOptions?.level || parseInt(args[1]);
        const roleArg = message.slashOptions?.role || message.mentions.roles.first();

        if (!subcommand) {
            // Show current role rewards
            const roleRewards = config.leveling.roleRewards[message.guild.id] || {};
            
            const embed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('🎖️ Level Role Rewards')
                .setDescription('Roles that are automatically assigned when users reach specific levels.')
                .setTimestamp();

            if (Object.keys(roleRewards).length === 0) {
                embed.addFields({ 
                    name: 'No Role Rewards Set', 
                    value: `Use \`${prefix}levelroles add <level> <@role>\` to add rewards!`,
                    inline: false 
                });
            } else {
                let rewardText = '';
                const sortedLevels = Object.keys(roleRewards).sort((a, b) => parseInt(a) - parseInt(b));
                
                for (const level of sortedLevels) {
                    const roleId = roleRewards[level];
                    const role = message.guild.roles.cache.get(roleId);
                    rewardText += `**Level ${level}** → ${role ? role.toString() : '`Role Deleted`'}\n`;
                }
                
                embed.addFields({ name: '🏆 Configured Rewards', value: rewardText, inline: false });
                embed.addFields({ 
                    name: '⚙️ Management', 
                    value: `\`${prefix}levelroles add <level> <@role>\` - Add reward\n\`${prefix}levelroles remove <level>\` - Remove reward`,
                    inline: false 
                });
            }

            return message.reply({ embeds: [embed] });
        }

        switch (subcommand) {
            case 'add':
            case 'set':
                if (!levelArg || isNaN(levelArg) || levelArg < 1) {
                    return message.reply(`Please provide a valid level! Example: \`${prefix}levelroles add 5 @Role\``);
                }

                if (!roleArg) {
                    return message.reply(`Please mention a role! Example: \`${prefix}levelroles add 5 @Role\``);
                }

                // Check bot can manage the role
                const botMember = message.guild.members.me;
                if (roleArg.position >= botMember.roles.highest.position) {
                    return message.reply('❌ I cannot assign this role as it is higher than or equal to my highest role!');
                }

                // Add to config
                if (!config.leveling.roleRewards[message.guild.id]) {
                    config.leveling.roleRewards[message.guild.id] = {};
                }
                config.leveling.roleRewards[message.guild.id][levelArg] = roleArg.id;

                // Save config
                const configPath = path.join(__dirname, '..', 'config.json');
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

                const addEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Role Reward Added!')
                    .setDescription(`Users who reach **Level ${levelArg}** will now receive ${roleArg}`)
                    .setTimestamp();

                message.reply({ embeds: [addEmbed] });
                break;

            case 'remove':
            case 'delete':
                if (!levelArg || isNaN(levelArg)) {
                    return message.reply(`Please provide a valid level! Example: \`${prefix}levelroles remove 5\``);
                }

                if (!config.leveling.roleRewards[message.guild.id] || 
                    !config.leveling.roleRewards[message.guild.id][levelArg]) {
                    return message.reply(`No role reward is set for Level ${levelArg}!`);
                }

                delete config.leveling.roleRewards[message.guild.id][levelArg];

                // Save config
                const configPath2 = path.join(__dirname, '..', 'config.json');
                fs.writeFileSync(configPath2, JSON.stringify(config, null, 2));

                const removeEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('🗑️ Role Reward Removed')
                    .setDescription(`Removed role reward for **Level ${levelArg}**`)
                    .setTimestamp();

                message.reply({ embeds: [removeEmbed] });
                break;

            default:
                message.reply(`Invalid action! Use \`${prefix}levelroles\` to see available commands.`);
        }
    }
};
