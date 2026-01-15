const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'setup',
    description: 'Configure bot settings for your server (Admin only)',
    execute(message, args, db, config) {
        // Check if user has admin permissions
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ You need Administrator permission to use this command!');
        }

        // Handle slash command options
        const slashAction = message.slashOptions?.action;
        const slashChannel = message.slashOptions?.channel; // Channel object for slash
        const slashPrefix = message.slashOptions?.prefix;

        const subcommand = slashAction || args[0]?.toLowerCase();

        // Resolve channel for both slash and prefix styles
        const mentionedChannel = message.mentions?.channels?.first?.() || null;
        const argChannelId = (args && args[1]) ? String(args[1]).replace(/[<#>]/g, '') : null;
        const resolvedArgChannel = argChannelId ? (message.guild.channels.cache.get(argChannelId) || null) : null;
        const channelArg = slashChannel || mentionedChannel || resolvedArgChannel || null;

        const prefixArg = slashPrefix || args[1];
        
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        if (!subcommand) {
            const welcomeChannel = guildSettings.welcomeChannelId 
                ? `<#${guildSettings.welcomeChannelId}>` 
                : 'Not set';
            const levelUpChannel = guildSettings.levelUpChannelId
                ? `<#${guildSettings.levelUpChannelId}>`
                : 'Same as message';
            const casinoChannel = guildSettings.casinoChannelId
                ? `<#${guildSettings.casinoChannelId}>`
                : 'Same as message';

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('⚙️ Server Configuration')
                .setDescription(`Current settings for **${message.guild.name}**`)
                .addFields(
                    { name: 'Welcome Channel', value: welcomeChannel, inline: true },
                    { name: 'Level Up Channel', value: levelUpChannel, inline: true },
                    { name: 'Casino Channel', value: casinoChannel, inline: true },
                    { name: 'Prefix', value: `\`${guildSettings.prefix || config.prefix}\``, inline: true },
                    { name: 'Welcome Enabled', value: guildSettings.welcomeEnabled ? '✅ Yes' : '❌ No', inline: true },
                    { name: 'Level Up Messages', value: guildSettings.levelUpMessages ? '✅ Enabled' : '❌ Disabled', inline: true },
                    {
                        name: '📝 Channel Setup Commands',
                        value: `\`${prefix}setup welcome <#channel>\` - Set welcome channel
\`${prefix}setup levelup <#channel>\` - Set level up messages channel
\`${prefix}setup casino <#channel>\` - Set casino/games channel
\`${prefix}setup toggle\` - Toggle welcomes
\`${prefix}setup levelupmsgs\` - Toggle level up messages`,
                        inline: false
                    }
                )
                .setFooter({ text: `Use ${prefix}setup <command> to configure • created by VadikGoel (aka VYPER GAMER)` })
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        switch (subcommand) {
            case 'welcome':
                // For slash commands, channelArg is already a channel object. For prefix, get from mentions
                const welcomeChannel = channelArg || message.mentions.channels.first();
                if (!welcomeChannel || !welcomeChannel.id) {
                    return message.reply(`Please mention a channel! Example: \`${prefix}setup welcome #general\``);
                }

                db.setWelcomeChannel(message.guild.id, welcomeChannel.id);
                db.setWelcomeEnabled(message.guild.id, true);
                db.save();

                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Welcome Channel Set!')
                    .setDescription(`Welcome messages will now be sent to <#${welcomeChannel.id}>`)
                    .setTimestamp();

                message.reply({ embeds: [embed] });
                break;

            case 'toggle':
                const settings = db.getGuildSettings(message.guild.id);
                const newState = !settings.welcomeEnabled;
                db.setWelcomeEnabled(message.guild.id, newState);
                db.save();

                const toggleEmbed = new EmbedBuilder()
                    .setColor(newState ? '#00ff00' : '#ff0000')
                    .setTitle(`Welcome Messages ${newState ? 'Enabled' : 'Disabled'}`)
                    .setDescription(newState 
                        ? '✅ Welcome messages are now enabled!' 
                        : '❌ Welcome messages are now disabled!')
                    .setTimestamp();

                message.reply({ embeds: [toggleEmbed] });
                break;

            case 'prefix':
                const newPrefix = prefixArg;
                if (!newPrefix || newPrefix.length > 5) {
                    return message.reply(`Please provide a valid prefix (max 5 characters)! Example: \`${prefix}setup prefix ?\``);
                }

                db.setGuildPrefix(message.guild.id, newPrefix);
                db.save();

                const prefixEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Prefix Updated!')
                    .setDescription(`Bot prefix changed to: \`${newPrefix}\``)
                    .setFooter({ text: `Example: ${newPrefix}help • created by VadikGoel (aka VYPER GAMER)` })
                    .setTimestamp();

                message.reply({ embeds: [prefixEmbed] });
                break;

            case 'levelupmsgs':
                const levelSettings = db.getGuildSettings(message.guild.id);
                const newLevelState = !levelSettings.levelUpMessages;
                db.setLevelUpMessages(message.guild.id, newLevelState);
                db.save();

                const levelEmbed = new EmbedBuilder()
                    .setColor(newLevelState ? '#00ff00' : '#ff0000')
                    .setTitle(`Level Up Messages ${newLevelState ? 'Enabled' : 'Disabled'}`)
                    .setDescription(newLevelState 
                        ? '✅ Level up messages will now be shown!' 
                        : '❌ Level up messages will now be silent!')
                    .setTimestamp();

                message.reply({ embeds: [levelEmbed] });
                break;

            case 'levelup':
                const levelupChannel = channelArg || message.mentions.channels.first();
                if (!levelupChannel || !levelupChannel.id) {
                    return message.reply(`Please mention a channel! Example: \`${prefix}setup levelup #levelups\``);
                }

                db.setLevelUpChannel(message.guild.id, levelupChannel.id);
                db.save();

                const levelupChannelEmbed = new EmbedBuilder()
                    .setColor('#ffd700')
                    .setTitle('✅ Level Up Channel Set!')
                    .setDescription(`Level up messages will now be sent to <#${levelupChannel.id}>`)
                    .setTimestamp();

                message.reply({ embeds: [levelupChannelEmbed] });
                break;

            case 'casino':
                const casinoChannel = channelArg || message.mentions.channels.first();
                if (!casinoChannel || !casinoChannel.id) {
                    return message.reply(`Please mention a channel! Example: \`${prefix}setup casino #casino\``);
                }

                db.setCasinoChannel(message.guild.id, casinoChannel.id);
                db.save();

                const casinoChannelEmbed = new EmbedBuilder()
                    .setColor('#9b59b6')
                    .setTitle('✅ Casino Channel Set!')
                    .setDescription(`All casino/game messages will now be sent to <#${casinoChannel.id}>`)
                    .setTimestamp();

                message.reply({ embeds: [casinoChannelEmbed] });
                break;

            case 'reset':
                db.createGuildSettings(message.guild.id);
                db.setWelcomeChannel(message.guild.id, null);
                db.setWelcomeEnabled(message.guild.id, false);
                db.setGuildPrefix(message.guild.id, config.prefix);
                db.setLevelUpMessages(message.guild.id, true);
                db.setLevelUpChannel(message.guild.id, null);
                db.setCasinoChannel(message.guild.id, null);

                const resetEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('🔄 Settings Reset')
                    .setDescription('All server settings have been reset to default!')
                    .setTimestamp();

                message.reply({ embeds: [resetEmbed] });
                break;

            default:
                message.reply('Invalid subcommand! Use `!setup` to see all available options.');
        }
    }
};
