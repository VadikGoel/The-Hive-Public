const crypto=require('crypto');const{Client,GatewayIntentBits,EmbedBuilder,AttachmentBuilder,Collection,Events}=require('discord.js'),fs=require('fs'),path=require('path'),config=require('./config.json'),Database=require('./database.js'),{registerSlashCommands}=require('./slashRegistrar');const _checksum=(str)=>crypto.createHash('sha256').update(str).digest('hex');const _validate_config=()=>{const checks=[{test:config.token,fail:'TOKEN_EMPTY'},{test:config.token!=='MTQ1NTg2OTk2NTgyMjQ2MDAxNQ.Gw0b_t.SnvhWBPVQ5J6qkF08Jds3GGZQ7gHr3OnKbtnmM',fail:'TOKEN_TEST'},{test:!config.token.includes('YOUR'),fail:'TOKEN_PLACEHOLDER'},{test:config.clientId,fail:'CLIENT_EMPTY'},{test:config.clientId!=='1455869965822460015',fail:'CLIENT_TEST'},{test:!config.clientId.includes('YOUR'),fail:'CLIENT_PLACEHOLDER'},{test:config.ownerIds&&Array.isArray(config.ownerIds)&&config.ownerIds.length>0,fail:'OWNER_MISSING'},{test:config.prefix&&config.prefix.length>0,fail:'PREFIX_MISSING'}];for(const c of checks)if(!c.test){console.error(`[ANTI-COPY] CODE SECURITY VIOLATION: ${c.fail}`),process.exit(1)}};_validate_config();const _verify_file_integrity=()=>{const files=['./database.js','./slashRegistrar.js','./slashDefinitions.js'];for(const f of files)if(!fs.existsSync(f)){console.error(`[INTEGRITY] Missing critical file: ${f}`),process.exit(1)}};_verify_file_integrity();const _runtime_check=setInterval(()=>{if(!config.token||config.token.includes('YOUR')){console.error('[RUNTIME] Configuration tampered with!'),process.exit(1)}},3e5);const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildVoiceStates]});const db=new Database();

// Wait for database to initialize before starting bot
(async () => {
    const _pre_init_check=()=>{if(!fs.existsSync('./config.json')){console.error('[INIT] config.json missing!'),process.exit(1)}const cfg=require('./config.json');if(!cfg.token||!cfg.clientId){console.error('[INIT] Critical config missing!'),process.exit(1)}};_pre_init_check();await db.initPromise;console.log('✅ Database initialized');
    
    // Command collection
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
})();

const xpCooldowns=new Collection();const _verify_ownership=()=>{const o=config.ownerIds;return o&&Array.isArray(o)&&o.length>0};const getOrdinalSuffix=n=>{const j=n%10,k=n%100;return 1===j&&11!==k?'st':2===j&&12!==k?'nd':3===j&&13!==k?'rd':'th'};if(!_verify_ownership()){console.error('❌ PROTECTION: Owner IDs not configured. Bot cannot start.'),process.exit(1)}

client.once('clientReady', async () => {
    console.log(`✅ Bot is online as ${client.user.tag}!`);
    console.log(`📊 Serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users!`);
    console.log(`🔧 Bot Prefix: "${config.prefix}"`);
    client.user.setActivity(`${config.prefix}help | ${client.guilds.cache.size} Servers`, { type: 'WATCHING' });

    // Optional: refresh slash commands on startup based on config flag
    if (config.features && config.features.refreshSlashOnStartup) {
        try {
            const scope = config.features.slashScope || 'global';
            const guildId = scope === 'guild' ? client.guilds.cache.first()?.id : undefined;
            const result = await registerSlashCommands({ clientId: config.clientId, token: config.token, guildId });
            console.log(`🛠️ Refreshed ${result.count} slash commands (${result.scope}).`);
        } catch (err) {
            console.warn('⚠️ Failed to refresh slash commands:', err?.message || err);
        }
    }

    // Initialize market state
    db.initializeMarketState();

    // Stock market scheduler - Weekly cycle with market open/close
    const marketScheduler = () => {
        const status = db.checkMarketStatus();
        
        // Update market state
        db.updateMarketState(status.currentDay, status.marketOpen);
        
        if (status.marketOpen) {
            // Market is open, update prices
            db.updateStockPrices();
            console.log(`📈 Market OPEN - Day ${status.currentDay}/5 | Stock prices updated (30-min cycle)`);
        } else {
            // Market is closed
            console.log(`🔴 Market CLOSED - Weekend (Day ${status.dayOfWeek === 6 ? 'Saturday' : 'Sunday'})`);
        }
        
        // Check if weekly reset needed (Monday 3 AM IST)
        if (status.needsReset) {
            console.log('🔄 Weekly market reset - New trading week started! 📊');
            db.resetWeeklyMarket();
        }
    };

    // Update stock prices every 30 minutes and check market status
    setInterval(marketScheduler, 30 * 60 * 1000); // 30 minutes

    // Initial market check
    marketScheduler();
    console.log('📊 Stock market initialized with 30-min update cycle (Mon-Fri) | Closed weekends');
});

// Welcome new members
client.on('guildMemberAdd', async (member) => {
    // Get guild settings
    const guildSettings = db.getGuildSettings(member.guild.id);
    
    // Check if welcome is enabled
    if (!guildSettings.welcomeEnabled) return;
    
    // Get welcome channel
    const welcomeChannel = guildSettings.welcomeChannelId 
        ? member.guild.channels.cache.get(guildSettings.welcomeChannelId)
        : null;
    
    if (!welcomeChannel) return;

    // Create user in database
    db.createUser(member.id, member.guild.id);

    const prefix = guildSettings.prefix || config.prefix;
    const memberCount = member.guild.memberCount;

    // Get custom welcome settings
    const welcomeSettings = db.getWelcomeCustomization(member.guild.id);

    // Apply placeholders to custom settings
    let title = welcomeSettings.title || '🐝 Welcome to the Hive! 🐝 ✨';
    let description = welcomeSettings.description || `Hey {user}! Welcome to **{server}**!\n\n🍯 **We've been waiting for you!** Sweet vibes, busy bees, and good times ahead. Buzz on in and make yourself at home.\n\n┈┈┈┈┈┈ 🌟 Hive Highlights 🌟 ┈┈┈┈┈┈\n• You are member **{count}**\n• Grab some nectar (drop a hello)\n• Make yourself at home in the comb 🏡`;
    let footer = welcomeSettings.footer || `{server} • Welcome Bot`;

    // Replace placeholders
    title = title.replace(/{user}/g, member.user.username)
                 .replace(/{server}/g, member.guild.name)
                 .replace(/{count}/g, memberCount);
    
    description = description.replace(/{user}/g, member.toString())
                             .replace(/{server}/g, member.guild.name)
                             .replace(/{count}/g, memberCount);
    
    footer = footer.replace(/{user}/g, member.user.username)
                   .replace(/{server}/g, member.guild.name)
                   .replace(/{count}/g, memberCount);

    // The Most Beautiful & Customizable Welcome Message
    const welcomeEmbed = new EmbedBuilder()
        .setColor(welcomeSettings.color || '#FFB347')
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
        .setFooter({ 
            text: footer,
            iconURL: member.guild.iconURL({ dynamic: true })
        })
        .setTimestamp();

    // Set image: prefer custom URL; else use local asset if enabled; else fallback remote default
    if (welcomeSettings.imageUrl) {
        welcomeEmbed.setImage(welcomeSettings.imageUrl);
    } else if (config.assets && config.assets.useLocalBanners) {
        const bannersDir = path.resolve(__dirname, config.assets.bannersPath || 'assets/banners');
        const defaultFile = config.assets.defaultBannerFile || 'bee_welcome.jpg';
        const bannerPath = path.join(bannersDir, defaultFile);
        if (fs.existsSync(bannerPath)) {
            const attachment = new AttachmentBuilder(bannerPath, { name: defaultFile });
            welcomeEmbed.setImage(`attachment://${defaultFile}`);
            try {
                await welcomeChannel.send({ embeds: [welcomeEmbed], files: [attachment] });
                return; // already sent with attachment
            } catch (err) {
                console.warn('Fallback to remote banner due to asset send error:', err?.message || err);
            }
        }
        // If file missing or sending failed, fall through to remote default
        const fallback = (config.images && config.images.welcomeFallbackUrl) ? config.images.welcomeFallbackUrl : 'https://media.discordapp.net/attachments/1459907365750182095/1459907590434586738/wmremove-transformed.jpeg?ex=6964fc65&is=6963aae5&hm=80778dfdebbf1ebea8b1bbf8f40c0069f34f20b429375c19e7d1e8cf8de0dc3b&=&format=webp&width=1280&height=543';
        welcomeEmbed.setImage(fallback);
    } else {
        const fallback = (config.images && config.images.welcomeFallbackUrl) ? config.images.welcomeFallbackUrl : 'https://media.discordapp.net/attachments/1459907365750182095/1459907590434586738/wmremove-transformed.jpeg?ex=6964fc65&is=6963aae5&hm=80778dfdebbf1ebea8b1bbf8f40c0069f34f20b429375c19e7d1e8cf8de0dc3b&=&format=webp&width=1280&height=543';
        welcomeEmbed.setImage(fallback);
    }

    try {
        // If not already sent with attachment above, send embed now
        await welcomeChannel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
        console.error('Failed to send welcome message:', error);
    }
});

// Basic slash interaction handler: reply with guidance to use prefix until full slash support is added
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    try {
        const cmdName = interaction.commandName.toLowerCase();
        
        // Special handling for setup command - show interactive interface
        if (cmdName === 'setup') {
            if (!interaction.member.permissions.has('ADMINISTRATOR')) {
                return interaction.reply({ content: '❌ You need **Administrator** permissions to use this command!', ephemeral: true });
            }

            const guildSettings = db.getGuildSettings(interaction.guild.id);
            const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder } = require('discord.js');

            // Display current settings
            const welcomeChannelStatus = guildSettings.welcomeChannelId ? `✅ <#${guildSettings.welcomeChannelId}>` : '❌ Not Set';
            const levelupChannelStatus = guildSettings.levelUpChannelId ? `✅ <#${guildSettings.levelUpChannelId}>` : '❌ Not Set';
            const casinoChannelStatus = guildSettings.casinoChannelId ? `✅ <#${guildSettings.casinoChannelId}>` : '❌ Not Set';
            const prefixStatus = `\`${guildSettings.prefix || config.prefix}\``;
            const welcomeEnabledStatus = guildSettings.welcomeEnabled ? '✅ Enabled' : '❌ Disabled';
            const levelupEnabledStatus = guildSettings.levelUpMessages ? '✅ Enabled' : '❌ Disabled';

            const settingsEmbed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('⚙️ Server Settings Configuration')
                .setDescription('Click the buttons below to configure your server settings')
                .addFields(
                    { 
                        name: '📩 Welcome Channel', 
                        value: welcomeChannelStatus, 
                        inline: true 
                    },
                    { 
                        name: '⭐ Level Up Channel', 
                        value: levelupChannelStatus, 
                        inline: true 
                    },
                    { 
                        name: '🎰 Casino Channel', 
                        value: casinoChannelStatus, 
                        inline: true 
                    },
                    { 
                        name: '🎯 Prefix', 
                        value: prefixStatus, 
                        inline: true 
                    },
                    { 
                        name: '👋 Welcome Messages', 
                        value: welcomeEnabledStatus, 
                        inline: true 
                    },
                    { 
                        name: '🏆 Level Up Messages', 
                        value: levelupEnabledStatus, 
                        inline: true 
                    }
                )
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 256 }))
                .setFooter({ text: 'Use the buttons and menus below to configure these settings' })
                .setTimestamp();

            const configButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setup_welcome_channel')
                        .setLabel('📩 Welcome Channel')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('setup_levelup_channel')
                        .setLabel('⭐ Level Up Channel')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('setup_casino_channel')
                        .setLabel('🎰 Casino Channel')
                        .setStyle(ButtonStyle.Primary)
                );

            const configButtons2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setup_prefix')
                        .setLabel('🎯 Change Prefix')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('setup_welcome_toggle')
                        .setLabel(guildSettings.welcomeEnabled ? '👋 Disable Welcome' : '👋 Enable Welcome')
                        .setStyle(guildSettings.welcomeEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('setup_levelup_toggle')
                        .setLabel(guildSettings.levelUpMessages ? '🏆 Disable Levelup' : '🏆 Enable Levelup')
                        .setStyle(guildSettings.levelUpMessages ? ButtonStyle.Danger : ButtonStyle.Success)
                );

            const configButtons3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('setup_reset')
                        .setLabel('🔄 Reset All Settings')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({ 
                embeds: [settingsEmbed], 
                components: [configButtons, configButtons2, configButtons3],
                ephemeral: false
            });
            return;
        }

        // Defer reply IMMEDIATELY to avoid timeout for other commands
        await interaction.deferReply().catch(() => {});
        
        // Check if channel is blacklisted
        const guildSettings = db.getGuildSettings(interaction.guild.id);
        if (db.isChannelBlacklisted(interaction.guild.id, interaction.channel.id)) {
            const casinoChannelId = guildSettings.casinoChannelId;
            
            if (casinoChannelId) {
                await interaction.editReply({
                    content: `${interaction.user}, you can only use commands in <#${casinoChannelId}>!`
                }).catch(() => {});
            } else {
                await interaction.editReply({
                    content: `❌ You can't use commands in this channel!`
                }).catch(() => {});
            }
            
            // Delete the reply after 25 seconds
            setTimeout(async () => {
                await interaction.deleteReply().catch(() => {});
            }, 25000);
            return;
        }
        
        const argText = interaction.options.getString('args') || '';
        const args = argText ? argText.trim().split(/\s+/) : [];

        const command = client.commands.get(cmdName) 
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
        if (!command) {
            await interaction.editReply({ content: '❌ Command not found!' }).catch(() => {});
            return;
        }

        // Create a minimal message shim so existing commands can run
    let firstReplyDone = false;
    const safeSend = async (payload) => {
        if (!firstReplyDone) {
            const msg = await interaction.editReply(payload);
            firstReplyDone = true;
            return msg;
        } else {
            return await interaction.followUp(payload);
        }
    };
    // Extract channel option if present
    const channelOpt = interaction.options.getChannel('channel');
    const userOpt = interaction.options.getUser('user');
    
    // Collect all slash options for commands that need them
    const slashOptions = {};
    const argValues = []; // Build args array for commands that still use positional args
    
    interaction.options.data.forEach(opt => {
      if (opt.type === 7) { // Channel
        slashOptions.channel = opt.channel;
      } else if (opt.type === 6) { // User
        slashOptions.user = opt.user;
        argValues.push(opt.user.id);
      } else if (opt.type === 4) { // Integer
        slashOptions[opt.name] = opt.value;
        argValues.push(String(opt.value));
      } else if (opt.type === 3) { // String
        slashOptions[opt.name] = opt.value;
        argValues.push(opt.value);
      }
    });
    
    // Override args if we have typed options
    const finalArgs = argValues.length > 0 ? argValues : args;
    
    const messageShim = {
        author: interaction.user,
        member: interaction.member,
        guild: interaction.guild,
        client,
        channel: channelOpt || interaction.channel,
        reply: safeSend,
        mentions: {
            users: { first: () => userOpt || null },
            channels: { first: () => channelOpt || null }
        },
        attachments: { first: () => null },
        content: `/${cmdName} ${argText}`,
        slashOptions // Pass typed options to commands
    };

    try {
        await command.execute(messageShim, finalArgs, db, config);
        // Do not auto-send a default message; commands should respond themselves.
    } catch (err) {
        console.error('Slash command error:', err);
        // Handle permission errors gracefully
        if (err.code === 50013) {
            await safeSend({ content: '❌ I don\'t have permission to send messages in that channel!' }).catch(() => {});
        } else {
            await safeSend({ content: `❌ Error: ${err?.message || err}` }).catch(() => {});
        }
    }
    } catch (error) {
        console.error('Interaction handler error:', error);
        // Don't try to reply if interaction is expired (code 10062)
        if (error.code !== 10062 && !interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
            } catch {}
        }
    }
});

// Handle button interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    try {
        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const guildId = interaction.guild.id;
        const guildSettings = db.getGuildSettings(guildId);

        if (interaction.customId === 'setup_welcome_channel') {
            const { ChannelSelectMenuBuilder } = require('discord.js');
            const channelSelect = new ActionRowBuilder()
                .addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_welcome_channel')
                        .setPlaceholder('Select welcome channel...')
                );

            await interaction.reply({ 
                content: 'Select a channel for welcome messages:',
                components: [channelSelect],
                ephemeral: true
            });
        }

        else if (interaction.customId === 'setup_levelup_channel') {
            const { ChannelSelectMenuBuilder } = require('discord.js');
            const channelSelect = new ActionRowBuilder()
                .addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_levelup_channel')
                        .setPlaceholder('Select level up channel...')
                );

            await interaction.reply({ 
                content: 'Select a channel for level up messages:',
                components: [channelSelect],
                ephemeral: true
            });
        }

        else if (interaction.customId === 'setup_casino_channel') {
            const { ChannelSelectMenuBuilder } = require('discord.js');
            const channelSelect = new ActionRowBuilder()
                .addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId('select_casino_channel')
                        .setPlaceholder('Select casino channel...')
                );

            await interaction.reply({ 
                content: 'Select a channel for casino messages:',
                components: [channelSelect],
                ephemeral: true
            });
        }

        else if (interaction.customId === 'setup_prefix') {
            await interaction.showModal({
                customId: 'prefix_modal',
                title: 'Change Bot Prefix',
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 4,
                                customId: 'prefix_input',
                                label: 'Enter new prefix (max 5 characters)',
                                style: 1,
                                placeholder: guildSettings.prefix || config.prefix,
                                minLength: 1,
                                maxLength: 5,
                                required: true
                            }
                        ]
                    }
                ]
            });
        }

        else if (interaction.customId === 'setup_welcome_toggle') {
            const newState = !guildSettings.welcomeEnabled;
            db.setWelcomeEnabled(guildId, newState);
            db.save();

            const embed = new EmbedBuilder()
                .setColor(newState ? '#00ff00' : '#ff0000')
                .setTitle(`✅ Welcome Messages ${newState ? 'Enabled' : 'Disabled'}`)
                .setDescription(newState 
                    ? '👋 Welcome messages will now be shown to new members!' 
                    : '🔇 Welcome messages are now silent!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        else if (interaction.customId === 'setup_levelup_toggle') {
            const newState = !guildSettings.levelUpMessages;
            db.setLevelUpMessages(guildId, newState);
            db.save();

            const embed = new EmbedBuilder()
                .setColor(newState ? '#00ff00' : '#ff0000')
                .setTitle(`✅ Level Up Messages ${newState ? 'Enabled' : 'Disabled'}`)
                .setDescription(newState 
                    ? '🏆 Level up messages will now be shown!' 
                    : '🔇 Level up messages are now silent!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        else if (interaction.customId === 'setup_reset') {
            const confirmRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('confirm_reset')
                        .setLabel('Yes, Reset All')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('cancel_reset')
                        .setLabel('Cancel')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({
                content: '🚨 **Are you sure?** This will reset ALL settings to default!',
                components: [confirmRow],
                ephemeral: true
            });
        }

        else if (interaction.customId === 'confirm_reset') {
            db.createGuildSettings(guildId);
            db.setWelcomeChannel(guildId, null);
            db.setWelcomeEnabled(guildId, false);
            db.setGuildPrefix(guildId, config.prefix);
            db.setLevelUpMessages(guildId, true);
            db.setLevelUpChannel(guildId, null);
            db.setCasinoChannel(guildId, null);
            db.save();

            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('🔄 Settings Reset Complete')
                .setDescription('All server settings have been reset to default!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        else if (interaction.customId === 'cancel_reset') {
            await interaction.reply({ content: '❌ Reset cancelled.', ephemeral: true });
        }
    } catch (error) {
        console.error('Button interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
            } catch {}
        }
    }
});

// Handle select menu interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChannelSelectMenu() && !interaction.isStringSelectMenu()) return;

    try {
        const { EmbedBuilder } = require('discord.js');
        const guildId = interaction.guild.id;
        const selectedChannelId = interaction.values[0];

        if (interaction.customId === 'select_welcome_channel') {
            db.setWelcomeChannel(guildId, selectedChannelId);
            db.setWelcomeEnabled(guildId, true);
            db.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Welcome Channel Set!')
                .setDescription(`Welcome messages will now be sent to <#${selectedChannelId}>`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        else if (interaction.customId === 'select_levelup_channel') {
            db.setLevelUpChannel(guildId, selectedChannelId);
            db.save();

            const embed = new EmbedBuilder()
                .setColor('#ffd700')
                .setTitle('✅ Level Up Channel Set!')
                .setDescription(`Level up messages will now be sent to <#${selectedChannelId}>`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        else if (interaction.customId === 'select_casino_channel') {
            db.setCasinoChannel(guildId, selectedChannelId);
            db.save();

            const embed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('✅ Casino Channel Set!')
                .setDescription(`Casino game results will now be sent to <#${selectedChannelId}>`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error('Select menu interaction error:', error);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
            } catch {}
        }
    }
});

// Handle modal submissions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;

    try {
        const { EmbedBuilder } = require('discord.js');

        if (interaction.customId === 'prefix_modal') {
            const newPrefix = interaction.fields.getTextInputValue('prefix_input');
            const guildId = interaction.guild.id;

            db.setGuildPrefix(guildId, newPrefix);
            db.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Prefix Updated!')
                .setDescription(`Bot prefix changed to: \`${newPrefix}\``)
                .setFooter({ text: `Example: ${newPrefix}help` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    } catch (error) {
        console.error('Modal submission error:', error);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
            } catch {}
        }
    }
});

// Message handler for XP and commands
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Increment message count for ALL messages (including commands)
    const userId = message.author.id;
    const guildId = message.guild.id;
    db.incrementMessageCount(userId, guildId);

    // Track message quest progress
    const missions = db.getOrCreateUserMissions(userId, guildId);
    for (const mission of missions) {
        if (mission.missionType === 'messages' && !mission.completed) {
            db.updateMissionProgress(userId, guildId, mission.id, 1);
            if (mission.progress + 1 >= mission.target) {
                db.completeMission(userId, guildId, mission.id);
            }
        }
    }

    // Sticky notes maintenance (refresh after N messages)
    try {
        const sticky = db.getStickyNote(message.guild.id, message.channel.id);
        if (sticky) {
            const count = (sticky.messageCounter || 0) + 1;
            if (count >= (sticky.threshold || (config.stickyNotes?.defaultThreshold ?? 2))) {
                // Delete previous sticky message if exists
                if (sticky.lastMessageId) {
                    const prev = await message.channel.messages.fetch(sticky.lastMessageId).catch(() => null);
                    if (prev) prev.delete().catch(() => {});
                }
                // Send new sticky note
                const embed = new EmbedBuilder()
                    .setColor('#74b9ff')
                    .setTitle('📌 Sticky Note')
                    .setDescription(sticky.content)
                    .setTimestamp();
                const sent = await message.channel.send({ embeds: [embed] }).catch(() => null);
                if (sent) {
                    db.updateStickyState(message.guild.id, message.channel.id, { lastMessageId: sent.id, messageCounter: 0 });
                }
            } else {
                db.updateStickyState(message.guild.id, message.channel.id, { messageCounter: count });
            }
        }
    } catch (e) {
        // Ignore sticky errors
    }

    // Counting channel enforcement
    const gs = db.getGuildSettings(message.guild.id);
    if (gs.countingChannelId && message.channel.id === gs.countingChannelId && config.counting?.enabled) {
        const text = message.content.trim();
        const isNumber = /^\d+$/.test(text);
        const state = db.getCountingState(message.guild.id);

        // Month rollover check
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
        if (state.currentMonth !== monthKey) {
            // Reward previous month top 3
            if (state.currentMonth) {
                const topPrev = db.getCounterLeaderboard(message.guild.id, state.currentMonth, 3);
                const rewards = config.counting.rewardTop3 || [500,300,100];
                const announceLines = [];
                topPrev.forEach((r, i) => {
                    const amt = rewards[i] || 0;
                    if (amt > 0) db.addCoins(r.userId, message.guild.id, amt);
                    announceLines.push(`${i+1}. <@${r.userId}> — **${r.count}** counts ${amt?`(+${amt} ${config.currency.name})`:''}`);
                });
                const embed = new EmbedBuilder()
                    .setColor('#fdcb6e')
                    .setTitle(`📅 Monthly Counting Results — ${state.currentMonth}`)
                    .setDescription(announceLines.length ? announceLines.join('\n') : 'No activity last month.')
                    .setTimestamp();
                const target = (gs.commandsChannelId && message.guild.channels.cache.get(gs.commandsChannelId)) || message.channel;
                target.send({ embeds: [embed] }).catch(()=>{});
            }
            // Set new current month
            db.setCountingState(message.guild.id, { currentMonth: monthKey, lastResetAt: now.toISOString() });
        }

        if (!isNumber) {
            // Delete non-number messages
            message.delete().catch(() => {});
            const hint = await message.channel.send({ content: `${message.author}, only numbers here! Next number is **${state.currentCount + 1}**.` }).catch(()=>null);
            if (hint) setTimeout(() => hint.delete().catch(()=>{}), (config.counting.wrongMsgDeleteSeconds || 30) * 1000);
            return; // Stop further processing
        }

        const value = parseInt(text, 10);
        const expected = (state.currentCount || 0) + 1;
        if (value !== expected || state.lastUserId === message.author.id) {
            // Wrong number or same user twice
            message.delete().catch(() => {});
            const warn = await message.channel.send({ content: `${message.author}, next number is **${expected}**.${state.lastUserId === message.author.id ? ' Wait for someone else before counting again.' : ''}` }).catch(()=>null);
            if (warn) setTimeout(() => warn.delete().catch(()=>{}), (config.counting.wrongMsgDeleteSeconds || 30) * 1000);
            return;
        }

        // Accept and record count
        db.setCountingState(message.guild.id, { currentCount: value, lastUserId: message.author.id });
        db.addCountForUser(message.guild.id, message.author.id, monthKey);
        // Continue to XP handling (counting messages still earn XP)
    }

    // XP and leveling system (using userId and guildId already defined above)
    // Check XP cooldown
    const cooldownKey = `${userId}-${guildId}`;
    if (!xpCooldowns.has(cooldownKey)) {
        // Award XP (3-8 XP per message for balanced progression)
        let xpGained = Math.floor(Math.random() * 6) + 3;
        
        // Apply XP booster if active
        const xpMultiplier = db.getEffectMultiplier(userId, guildId, 'xp');
        xpGained = Math.floor(xpGained * xpMultiplier);
        
        const result = db.addXP(userId, guildId, xpGained);

        if (result.leveledUp) {
            let coinsEarned = config.leveling.coinsPerLevel * result.newLevel;
            
            // Apply coin multiplier if active
            const coinMultiplier = db.getEffectMultiplier(userId, guildId, 'coins');
            coinsEarned = Math.floor(coinsEarned * coinMultiplier);
            
            db.addCoins(userId, guildId, coinsEarned);

            // Check for role rewards at this level
            const roleRewards = config.leveling.roleRewards?.[guildId];
            if (roleRewards && roleRewards[result.newLevel]) {
                const roleId = roleRewards[result.newLevel];
                const role = message.guild.roles.cache.get(roleId);
                if (role) {
                    try {
                        await message.member.roles.add(role);
                        console.log(`✅ Assigned role ${role.name} to ${message.author.tag} for reaching Level ${result.newLevel}`);
                    } catch (err) {
                        console.error('Failed to assign role reward:', err);
                    }
                }
            }

            // Check if level up messages are enabled for this guild
            const guildSettings = db.getGuildSettings(guildId);
            if (guildSettings.levelUpMessages) {
                let description = `${message.author} just advanced to **Level ${result.newLevel}**!`;
                if (xpMultiplier > 1) description += ` 🔥 **(${xpMultiplier}x XP Boost)**`;
                if (coinMultiplier > 1) description += ` 💰 **(${coinMultiplier}x Coin Boost)**`;
                
                // Check if role reward was given
                const roleRewards = config.leveling.roleRewards?.[guildId];
                if (roleRewards && roleRewards[result.newLevel]) {
                    const roleId = roleRewards[result.newLevel];
                    const role = message.guild.roles.cache.get(roleId);
                    if (role) description += `\n🎖️ **New Role:** ${role}`;
                }
                
                const levelUpEmbed = new EmbedBuilder()
                    .setColor('#ffd700')
                    .setTitle('🎊 LEVEL UP!')
                    .setDescription(description)
                    .addFields(
                        { name: '🆙 New Level', value: `${result.newLevel}`, inline: true },
                        { name: '⭐ XP', value: `${result.xp}/${result.xpNeeded}`, inline: true },
                        { name: '💰 Reward', value: `+${coinsEarned} ${config.currency.name}`, inline: true }
                    )
                    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                    .setTimestamp();

                if (config.images?.levelUpBannerUrl) {
                    levelUpEmbed.setImage(config.images.levelUpBannerUrl);
                }

                // Send to level up channel if set, otherwise send to current channel
                const levelUpChannelId = guildSettings.levelUpChannelId;
                if (levelUpChannelId) {
                    const levelUpChannel = message.guild.channels.cache.get(levelUpChannelId);
                    if (levelUpChannel) {
                        levelUpChannel.send({ embeds: [levelUpEmbed] });
                    } else {
                        message.channel.send({ embeds: [levelUpEmbed] });
                    }
                } else {
                    message.channel.send({ embeds: [levelUpEmbed] });
                }
            }
        }

        // Set cooldown
        xpCooldowns.set(cooldownKey, true);
        setTimeout(() => xpCooldowns.delete(cooldownKey), config.leveling.xpCooldown);
    }

    // Command handler with per-guild prefix support
    const guildSettings = db.getGuildSettings(guildId);
    const guildPrefix = (guildSettings && guildSettings.prefix) ? guildSettings.prefix : config.prefix;
    
    if (!message.content.startsWith(guildPrefix)) return;

    // Check if channel is blacklisted
    if (db.isChannelBlacklisted(message.guild.id, message.channel.id)) {
        // Send notification to casino channel or current channel
        const casinoChannelId = guildSettings.casinoChannelId;
        const targetChannel = casinoChannelId ? message.guild.channels.cache.get(casinoChannelId) : null;
        
        if (targetChannel) {
            // Send to casino channel
            const response = await targetChannel.send({
                content: `${message.author}, you can only use commands in <#${targetChannel.id}>!`
            }).catch(() => null);
            if (response) {
                setTimeout(() => response.delete().catch(() => {}), 25000);
            }
        } else {
            // Send in current channel
            const response = await message.reply({
                content: `❌ You can't use commands in this channel!`
            }).catch(() => null);
            if (response) {
                setTimeout(() => response.delete().catch(() => {}), 25000);
            }
        }
        return;
    }

    const args = message.content.slice(guildPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) 
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        command.execute(message, args, db, config);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command!');
    }
});

// Voice state tracking
const voiceJoinTimes = new Map();

client.on('voiceStateUpdate', (oldState, newState) => {
    const userId = newState.id;
    const guildId = newState.guild.id;

    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
        voiceJoinTimes.set(`${userId}-${guildId}`, Date.now());
    }

    // User left a voice channel
    if (oldState.channelId && !newState.channelId) {
        const joinTime = voiceJoinTimes.get(`${userId}-${guildId}`);
        if (joinTime) {
            const timeSpent = Math.floor((Date.now() - joinTime) / 1000); // seconds
            db.addVoiceTime(userId, guildId, timeSpent);
            voiceJoinTimes.delete(`${userId}-${guildId}`);
        }
    }

    // User switched channels (count as continuous session)
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        // Keep the same join time, don't reset
    }
});

// Handle stock market button interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const { EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

    try {
        // Buy Stock Button
        if (interaction.customId === 'stock_buy') {
            const modal = new ModalBuilder()
                .setCustomId('stock_buy_modal')
                .setTitle('💰 Buy Stocks');

            const symbolInput = new TextInputBuilder()
                .setCustomId('stock_symbol')
                .setLabel('Stock Symbol (e.g., TECH, MOON, BUZZ)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter stock symbol...')
                .setRequired(true)
                .setMaxLength(10);

            const quantityInput = new TextInputBuilder()
                .setCustomId('stock_quantity')
                .setLabel('Quantity (How many shares?)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter number of shares...')
                .setRequired(true)
                .setMaxLength(10);

            const row1 = new ActionRowBuilder().addComponents(symbolInput);
            const row2 = new ActionRowBuilder().addComponents(quantityInput);

            modal.addComponents(row1, row2);
            await interaction.showModal(modal);
        }

        // Sell Stock Button
        else if (interaction.customId === 'stock_sell') {
            const modal = new ModalBuilder()
                .setCustomId('stock_sell_modal')
                .setTitle('💵 Sell Stocks');

            const symbolInput = new TextInputBuilder()
                .setCustomId('stock_symbol')
                .setLabel('Stock Symbol (e.g., TECH, MOON, BUZZ)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter stock symbol...')
                .setRequired(true)
                .setMaxLength(10);

            const quantityInput = new TextInputBuilder()
                .setCustomId('stock_quantity')
                .setLabel('Quantity (How many shares?)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Enter number of shares...')
                .setRequired(true)
                .setMaxLength(10);

            const row1 = new ActionRowBuilder().addComponents(symbolInput);
            const row2 = new ActionRowBuilder().addComponents(quantityInput);

            modal.addComponents(row1, row2);
            await interaction.showModal(modal);
        }

        // Portfolio Button
        else if (interaction.customId === 'stock_portfolio') {
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;
            const portfolio = db.getPortfolio(userId, guildId);

            if (!portfolio || portfolio.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('📂 Your Portfolio')
                    .setDescription('You don\'t own any stocks yet!\n\nUse **💰 Buy Stocks** button to start trading.')
                    .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            let totalValue = 0;
            let totalInvested = 0;
            let holdings = '';

            for (const holding of portfolio) {
                const stock = db.getStock(holding.stockSymbol);
                if (!stock) continue;

                const currentValue = stock.currentPrice * holding.quantity;
                const investedValue = holding.boughtPrice * holding.quantity;
                const profit = currentValue - investedValue;
                const profitPercent = ((profit / investedValue) * 100).toFixed(2);
                const profitIcon = profit >= 0 ? '📈' : '📉';

                totalValue += currentValue;
                totalInvested += investedValue;

                holdings += `**${holding.stockSymbol}** - ${holding.quantity} shares\n`;
                holdings += `Bought: $${holding.boughtPrice.toFixed(2)} | Now: $${stock.currentPrice.toFixed(2)}\n`;
                holdings += `Value: $${currentValue.toFixed(2)} | ${profitIcon} ${profit >= 0 ? '+' : ''}${profitPercent}%\n\n`;
            }

            const totalProfit = totalValue - totalInvested;
            const totalProfitPercent = ((totalProfit / totalInvested) * 100).toFixed(2);

            const embed = new EmbedBuilder()
                .setColor(totalProfit >= 0 ? '#00D166' : '#E74C3C')
                .setTitle('📂 Your Portfolio')
                .setDescription(holdings)
                .addFields(
                    { name: 'Total Value', value: `$${totalValue.toFixed(2)}`, inline: true },
                    { name: 'Total Invested', value: `$${totalInvested.toFixed(2)}`, inline: true },
                    { name: 'Total P/L', value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toFixed(2)} (${totalProfitPercent}%)`, inline: true }
                )
                .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Refresh Button
        else if (interaction.customId === 'stock_refresh') {
            await interaction.deferUpdate();
            const stocksCommand = require('./commands/stocks.js');
            await stocksCommand.executeSlash(interaction, db, config);
        }

        // Chart Refresh Button
        else if (interaction.customId.startsWith('chart_refresh_')) {
            const symbol = interaction.customId.replace('chart_refresh_', '');
            
            // Show loading state with animation
            await interaction.update({
                embeds: [new EmbedBuilder()
                    .setColor('#3498DB')
                    .setTitle(`📊 ${symbol} Stock Chart`)
                    .setDescription('```\n🔄 Refreshing chart data...\n   ⬤ ⬤ ⬤\n```')
                    .setFooter({ text: 'Please wait...' })
                ],
                components: []
            });

            // Simulate real-time data fetch delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Manually build and send updated chart since interaction is already replied
            const stock = db.getStock(symbol);
            if (!stock) {
                return await interaction.editReply({ 
                    embeds: [new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setDescription(`❌ Stock **${symbol}** not found!`)
                    ],
                    components: []
                });
            }

            let history = [];
            try {
                history = JSON.parse(stock.history || '[]');
            } catch (e) {
                history = [];
            }

            if (history.length === 0) {
                return await interaction.editReply({
                    embeds: [new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setDescription(`No price history for **${symbol}** yet.`)
                    ],
                    components: []
                });
            }

            const stockChartCommand = require('./commands/stock-chart.js');
            
            // Create chart using the command's internal function
            const createChart = (history, width, height) => {
                if (history.length === 0) return 'No data';
                const minPrice = Math.min(...history);
                const maxPrice = Math.max(...history);
                const range = maxPrice - minPrice || 1;
                const sampled = [];
                const step = Math.max(1, Math.floor(history.length / width));
                for (let i = 0; i < history.length; i += step) {
                    sampled.push(history[i]);
                }
                let chart = '';
                for (let y = height - 1; y >= 0; y--) {
                    const threshold = minPrice + (range / height) * y;
                    let line = '';
                    for (let x = 0; x < sampled.length; x++) {
                        const price = sampled[x];
                        if (price >= threshold) {
                            line += '█';
                        } else {
                            line += ' ';
                        }
                    }
                    chart += line.trimEnd() + '\n';
                }
                chart += '─'.repeat(Math.min(sampled.length, width)) + '\n';
                chart += `$${minPrice.toFixed(0).padStart(5)} - $${maxPrice.toFixed(0).padStart(5)}`;
                return chart;
            };

            const getTrend = (history) => {
                if (history.length < 2) return '📊 Insufficient data';
                const first10 = history.slice(0, Math.ceil(history.length / 3)).reduce((a, b) => a + b) / Math.ceil(history.length / 3);
                const last10 = history.slice(-Math.ceil(history.length / 3)).reduce((a, b) => a + b) / Math.ceil(history.length / 3);
                if (last10 > first10 * 1.05) return '📈 Strong Uptrend';
                if (last10 > first10) return '📈 Mild Uptrend';
                if (last10 < first10 * 0.95) return '📉 Strong Downtrend';
                if (last10 < first10) return '📉 Mild Downtrend';
                return '➡️ Stable';
            };

            const chart = createChart(history, 20, 10);
            const minPrice = Math.min(...history);
            const maxPrice = Math.max(...history);
            const currentPrice = stock.currentPrice;
            const startPrice = history[0];
            const change = currentPrice - startPrice;
            const changePercent = (change / startPrice * 100).toFixed(2);
            const changeIcon = change >= 0 ? '📈' : '📉';
            const avgPrice = (history.reduce((a, b) => a + b, 0) / history.length).toFixed(2);

            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            
            const embed = new EmbedBuilder()
                .setColor(change >= 0 ? '#00C851' : '#E74C3C')
                .setTitle(`📊 ${symbol} Stock Chart (30 Days)`)
                .setDescription(`\`\`\`${chart}\`\`\``)
                .addFields(
                    { name: 'Current Price', value: `$${currentPrice.toFixed(2)}`, inline: true },
                    { name: 'Change', value: `${changeIcon} ${changePercent}%\n(${change > 0 ? '+' : ''}$${change.toFixed(2)})`, inline: true },
                    { name: 'High/Low', value: `$${maxPrice.toFixed(2)} / $${minPrice.toFixed(2)}`, inline: true },
                    { name: 'Average Price', value: `$${avgPrice}`, inline: true },
                    { name: 'History Points', value: `${history.length}/30 points\n(30-min updates)`, inline: true },
                    { name: '30-Day Trend', value: getTrend(history), inline: true }
                )
                .setFooter({ text: '✅ Chart refreshed! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`chart_refresh_${symbol}`)
                        .setLabel('🔄 Refresh Chart')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('stock_refresh')
                        .setLabel('📊 Back to Stocks')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.editReply({ embeds: [embed], components: [row] });
        }

    } catch (error) {
        console.error('Stock button error:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
        }
    }
});

// Handle stock modal submissions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('stock_')) return;

    const { EmbedBuilder } = require('discord.js');

    try {
        const symbol = interaction.fields.getTextInputValue('stock_symbol').toUpperCase();
        const quantity = parseInt(interaction.fields.getTextInputValue('stock_quantity'));

        if (isNaN(quantity) || quantity <= 0) {
            return interaction.reply({ content: '❌ Please enter a valid quantity!', ephemeral: true });
        }

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const stock = db.getStock(symbol);

        if (!stock) {
            return interaction.reply({ content: `❌ Stock **${symbol}** not found! Available stocks: TECH, MOON, BUZZ, WAVE, PEAK, FLOW, NEXUS, SPARK`, ephemeral: true });
        }

        // Buy Stock Modal
        if (interaction.customId === 'stock_buy_modal') {
            const totalCost = stock.currentPrice * quantity;
            const result = db.buyStock(userId, guildId, symbol, quantity, stock.currentPrice);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('❌ Purchase Failed')
                    .setDescription(`**Reason:** ${result.error}\n**Required:** $${totalCost.toFixed(2)}\n\nUse \`,work\` or \`,daily\` to earn more coins!`)
                    .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#00D166')
                .setTitle('✅ Stock Purchase Successful!')
                .setDescription(`You bought **${quantity}** shares of **${symbol}**`)
                .addFields(
                    { name: 'Price per Share', value: `$${stock.currentPrice.toFixed(2)}`, inline: true },
                    { name: 'Total Cost', value: `$${totalCost.toFixed(2)}`, inline: true },
                    { name: 'Shares Owned', value: `${quantity}`, inline: true }
                )
                .setFooter({ text: 'Track with /portfolio • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Sell Stock Modal
        else if (interaction.customId === 'stock_sell_modal') {
            const result = db.sellStock(userId, guildId, symbol, quantity);

            if (!result.success) {
                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('❌ Sale Failed')
                    .setDescription(`**Reason:** ${result.error}\n\nCheck your portfolio with \`/portfolio\``)
                    .setFooter({ text: 'created by VadikGoel (aka VYPER GAMER)' })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            const profitIcon = result.profit >= 0 ? '📈' : '📉';
            const profitColor = result.profit >= 0 ? '#00D166' : '#E74C3C';

            const embed = new EmbedBuilder()
                .setColor(profitColor)
                .setTitle('✅ Stock Sale Successful!')
                .setDescription(`You sold **${quantity}** shares of **${symbol}**`)
                .addFields(
                    { name: 'Sale Value', value: `$${result.totalReturn.toFixed(2)}`, inline: true },
                    { name: 'Profit/Loss', value: `${profitIcon} ${result.profit >= 0 ? '+' : ''}$${result.profit.toFixed(2)}`, inline: true },
                    { name: 'Current Price', value: `$${stock.currentPrice.toFixed(2)}`, inline: true }
                )
                .setFooter({ text: 'Well traded! • created by VadikGoel (aka VYPER GAMER)' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }

    } catch (error) {
        console.error('Stock modal error:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ An error occurred!', ephemeral: true });
        }
    }
});

client.login(config.token);
