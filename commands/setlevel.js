const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'setlevel',
    description: 'Set a user\'s level (Admin only)',
    aliases: ['levelset'],
    async execute(message, args, db, config) {
        // Check admin permission
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission to use this command!');
        }

        const targetUser = message.mentions.users.first() || message.slashOptions?.user;
        const newLevel = message.slashOptions?.level || parseInt(args[1]);

        if (!targetUser) {
            return message.reply('❌ Please mention a user! Example: `,setlevel @user 10`');
        }

        if (!newLevel || isNaN(newLevel) || newLevel < 0) {
            return message.reply('❌ Please provide a valid level (0 or higher)! Example: `,setlevel @user 10`');
        }

        // Create user if doesn't exist
        db.createUser(targetUser.id, message.guild.id);

        // Set the new level and XP
        const xpForLevel = newLevel > 0 ? db.calculateXPNeeded(newLevel - 1) : 0;
        const stmt = db.prepare(`
            UPDATE users 
            SET level = ?, xp = ? 
            WHERE userId = ? AND guildId = ?
        `);
        stmt.run(newLevel, xpForLevel, targetUser.id, message.guild.id);

        // Try to assign level roles
        const roleRewards = config.leveling.roleRewards[message.guild.id] || {};
        const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
        
        let roleMessages = [];
        let canManageRoles = message.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles);

        if (member && Object.keys(roleRewards).length > 0) {
            // Get all roles user should have based on level
            const rolesToAdd = [];
            for (const [level, roleId] of Object.entries(roleRewards)) {
                if (parseInt(level) <= newLevel) {
                    const role = message.guild.roles.cache.get(roleId);
                    if (role && !member.roles.cache.has(roleId)) {
                        rolesToAdd.push({ level: parseInt(level), role });
                    }
                }
            }

            // Try to assign roles
            if (rolesToAdd.length > 0) {
                if (!canManageRoles) {
                    roleMessages.push(`\n⚠️ **I don't have permission to assign roles!**`);
                    roleMessages.push(`User should have the following roles based on Level ${newLevel}:`);
                    rolesToAdd.forEach(({ level, role }) => {
                        roleMessages.push(`• Level ${level}: ${role.name}`);
                    });
                    roleMessages.push(`\n📖 For setup help, use \`/how-to-setup\` or \`,how-to-setup\``);
                } else {
                    for (const { level, role } of rolesToAdd) {
                        try {
                            if (role.position >= message.guild.members.me.roles.highest.position) {
                                roleMessages.push(`⚠️ Cannot assign ${role} - role is higher than my highest role`);
                            } else {
                                await member.roles.add(role);
                                roleMessages.push(`✅ Added ${role} (Level ${level})`);
                            }
                        } catch (error) {
                            roleMessages.push(`❌ Failed to add ${role} - ${error.message}`);
                        }
                    }
                }
            }
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Level Updated!')
            .setDescription(`Successfully set ${targetUser}'s level to **${newLevel}**`)
            .addFields(
                { name: '👤 User', value: targetUser.tag, inline: true },
                { name: '📊 New Level', value: `${newLevel}`, inline: true },
                { name: '⭐ XP Reset', value: `${xpForLevel} XP`, inline: true }
            )
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
            .setTimestamp();

        if (roleMessages.length > 0) {
            embed.addFields({ 
                name: '🎖️ Role Assignment', 
                value: roleMessages.join('\n'), 
                inline: false 
            });
        }

        message.reply({ embeds: [embed] });
    }
};
