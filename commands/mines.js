const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Active games storage
const activeGames = new Map();

module.exports = {
    name: 'mines',
    description: 'Interactive minesweeper game with buttons',
    async execute(message, args, db, config) {
        const guildSettings = db.getGuildSettings(message.guild.id);
        const prefix = guildSettings.prefix || config.prefix;

        // Check if user already has an active game
        if (activeGames.has(message.author.id)) {
            return message.reply('❌ You already have an active minesweeper game! Finish it first.');
        }

        // Parse difficulty from slash option or args
        let difficultyInput = message.slashOptions?.difficulty || args[0] || 'normal';
        difficultyInput = difficultyInput.toLowerCase();
        
        let difficulty, mineCount, boardSize;
        
        if (['easy', 'e'].includes(difficultyInput)) {
            mineCount = 3;
            boardSize = 4;
            difficulty = 'Easy';
        } else if (['hard', 'h'].includes(difficultyInput)) {
            mineCount = 7;
            boardSize = 4;
            difficulty = 'Hard';
        } else if (['expert', 'ex'].includes(difficultyInput)) {
            mineCount = 10;
            boardSize = 5;
            difficulty = 'Expert';
        } else {
            mineCount = 5;
            boardSize = 4;
            difficulty = 'Normal';
        }

        const user = db.getUser(message.author.id, message.guild.id);
        if (!user) {
            db.createUser(message.author.id, message.guild.id);
        }
        // Calculate cooldown and reward based on level
        const userLevel = user?.level || 1;
        const cooldownSeconds = Math.max(5, Math.floor(60 / userLevel));
        const baseReward = 1500;
        const maxReward = 3500;

        // Create game state
        const totalCells = boardSize * boardSize;
        const board = createBoard(boardSize, mineCount);
        const gameState = {
            userId: message.author.id,
            board,
            boardSize,
            mineCount,
            difficulty,
            revealed: Array(totalCells).fill(false),
            flagged: Array(totalCells).fill(false),
            flagMode: false,
            moves: 0,
            gameOver: false,
            won: false,
            startTime: Date.now(),
            cooldown: cooldownSeconds,
            baseReward,
            maxReward,
            userLevel
        };

        activeGames.set(message.author.id, gameState);

        // Send initial game board
        const embed = createGameEmbed(gameState, message.author, config);
        const components = createGameComponents(gameState);

        const gameMsg = await message.reply({ embeds: [embed], components });
        gameState.messageId = gameMsg.id;

        // Collector for button interactions
        const collector = gameMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: cooldownSeconds * 1000
        });

        collector.on('collect', async (interaction) => {
            if (!activeGames.has(message.author.id)) {
                return interaction.reply({ content: '❌ Game expired or already finished.', ephemeral: true });
            }

            const state = activeGames.get(message.author.id);
            if (state.gameOver) {
                return interaction.reply({ content: '❌ Game is already over!', ephemeral: true });
            }

            const customId = interaction.customId;

            if (customId === 'flag_toggle') {
                state.flagMode = !state.flagMode;
                const newEmbed = createGameEmbed(state, message.author, config);
                const newComponents = createGameComponents(state);
                await interaction.update({ embeds: [newEmbed], components: newComponents });
            } else if (customId === 'reveal_all') {
                // End game and reveal all
                state.gameOver = true;
                state.won = false;
                const finalEmbed = createGameEmbed(state, message.author, config);
                const finalComponents = createGameComponents(state);
                await interaction.update({ embeds: [finalEmbed], components: finalComponents });
                activeGames.delete(message.author.id);
                collector.stop();
            } else if (customId.startsWith('cell_')) {
                const index = parseInt(customId.split('_')[1]);
                
                if (state.flagMode) {
                    // Toggle flag
                    state.flagged[index] = !state.flagged[index];
                } else {
                    // Reveal cell
                    if (state.flagged[index]) {
                        return interaction.reply({ content: '❌ Remove flag first!', ephemeral: true });
                    }
                    if (state.revealed[index]) {
                        return interaction.reply({ content: '❌ Already revealed!', ephemeral: true });
                    }

                    state.revealed[index] = true;
                    state.moves++;

                    if (state.board[index] === '💣') {
                        // Hit mine - game over
                        state.gameOver = true;
                        state.won = false;
                    } else {
                        // Check win condition
                        const allSafeRevealed = state.board.every((cell, i) => 
                            cell === '💣' || state.revealed[i]
                        );
                        if (allSafeRevealed) {
                            state.gameOver = true;
                            state.won = true;
                            
                            // Award coins
                            const reward = calculateReward(state);
                            db.addCoins(message.author.id, message.guild.id, reward);
                            
                            // Track mines completion for missions
                            const missions = db.getOrCreateUserMissions(message.author.id, message.guild.id);
                            for (const mission of missions) {
                                if (mission.missionType === 'mines' && !mission.completed) {
                                    db.updateMissionProgress(message.author.id, message.guild.id, mission.id, 1);
                                    if (mission.progress + 1 >= mission.target) {
                                        db.completeMission(message.author.id, message.guild.id, mission.id);
                                    }
                                }
                            }
                        }
                    }
                }

                const newEmbed = createGameEmbed(state, message.author, config);
                const newComponents = createGameComponents(state);
                await interaction.update({ embeds: [newEmbed], components: newComponents });

                if (state.gameOver) {
                    activeGames.delete(message.author.id);
                    collector.stop();
                }
            }
        });

        collector.on('end', () => {
            if (activeGames.has(message.author.id)) {
                const state = activeGames.get(message.author.id);
                if (!state.gameOver) {
                    state.gameOver = true;
                    state.won = false;
                    const finalEmbed = createGameEmbed(state, message.author, config);
                    gameMsg.edit({ embeds: [finalEmbed], components: [] }).catch(() => {});
                }
                activeGames.delete(message.author.id);
            }
        });
    }
};

function createBoard(size, mineCount) {
    const totalCells = size * size;
    const board = Array(totalCells).fill('✅');
    
    // Place mines randomly
    const minePositions = new Set();
    while (minePositions.size < mineCount) {
        const pos = Math.floor(Math.random() * totalCells);
        minePositions.add(pos);
    }
    
    minePositions.forEach(pos => {
        board[pos] = '💣';
    });
    
    return board;
}

function createGameEmbed(state, author, config) {
    const flagCount = state.flagged.filter(f => f).length;
    const timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const timeLeft = Math.max(0, state.cooldown - timeElapsed);

    let description = state.gameOver
        ? `Game over — board revealed.`
        : `Clear the board without hitting a mine. Toggle flag mode to mark suspected spots.\nYou have **${timeLeft} seconds** per game.`;

    const embed = new EmbedBuilder()
        .setColor(state.gameOver ? (state.won ? '#2ECC71' : '#E74C3C') : '#9B59B6')
        .setTitle('💣 Minesweeper')
        .setDescription(description)
        .addFields(
            { name: 'Difficulty', value: `🔵 ${state.difficulty}`, inline: true },
            { name: 'Board', value: `${state.boardSize}x${state.boardSize}`, inline: true },
            { name: 'Mines', value: `${state.mineCount}`, inline: true },
            { name: 'Moves', value: `${state.moves}`, inline: true },
            { name: 'Flags', value: `${flagCount}/${state.mineCount}`, inline: true },
            { name: 'Mode', value: state.flagMode ? '🚩 Flagging' : '🔵 Revealing', inline: true }
        );

    if (!state.gameOver) {
        embed.addFields(
            { name: 'Cooldown', value: `${timeLeft}s (Level ${state.userLevel})`, inline: true },
            { name: 'Reward', value: `Win payout: ${state.baseReward.toLocaleString()}–${state.maxReward.toLocaleString()} (VIP 2x after roll)`, inline: true }
        );
    } else {
        if (state.won) {
            const reward = calculateReward(state);
            embed.addFields(
                { name: 'Result', value: `✨ You cleared all safe spots!`, inline: false },
                { name: 'Reward', value: `+${reward.toLocaleString()} ${config.currency.symbol}`, inline: true }
            );
        } else {
            embed.addFields(
                { name: 'Result', value: `💥 You hit a mine.`, inline: false },
                { name: 'Reward', value: `0 (only awarded on win)`, inline: true }
            );
        }
    }

    embed.setFooter({ text: `${author.tag} • created by VadikGoel (aka VYPER GAMER)`, iconURL: author.displayAvatarURL() });
    embed.setTimestamp();

    return embed;
}

function createGameComponents(state) {
    const rows = [];
    const { boardSize, board, revealed, flagged, gameOver } = state;
    
    // Number emojis for safe revealed cells
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

    for (let row = 0; row < boardSize; row++) {
        const actionRow = new ActionRowBuilder();
        for (let col = 0; col < boardSize; col++) {
            const index = row * boardSize + col;
            let emoji = '🟦';
            let style = ButtonStyle.Primary;
            let disabled = false;

            if (gameOver) {
                // Reveal everything
                if (board[index] === '💣') {
                    emoji = '💣';
                    style = revealed[index] ? ButtonStyle.Danger : ButtonStyle.Secondary;
                } else if (revealed[index]) {
                    emoji = numberEmojis[index % 9];
                    style = ButtonStyle.Success;
                } else {
                    emoji = '🟦';
                    style = ButtonStyle.Secondary;
                }
                disabled = true;
            } else {
                if (flagged[index]) {
                    emoji = '🚩';
                    style = ButtonStyle.Secondary;
                } else if (revealed[index]) {
                    if (board[index] === '💣') {
                        emoji = '💣';
                        style = ButtonStyle.Danger;
                    } else {
                        emoji = numberEmojis[index % 9];
                        style = ButtonStyle.Success;
                    }
                    disabled = true;
                } else {
                    emoji = '🟦';
                    style = ButtonStyle.Primary;
                }
            }

            const button = new ButtonBuilder()
                .setCustomId(`cell_${index}`)
                .setEmoji(emoji)
                .setStyle(style)
                .setDisabled(disabled);

            actionRow.addComponents(button);
        }
        rows.push(actionRow);
    }

    // Control buttons
    const controlRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('flag_toggle')
                .setLabel(`Flag Mode: ${state.flagMode ? 'ON' : 'OFF'}`)
                .setStyle(state.flagMode ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(state.gameOver),
            new ButtonBuilder()
                .setCustomId('reveal_all')
                .setLabel('Reveal Mines')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(state.gameOver)
        );

    rows.push(controlRow);
    return rows;
}

function calculateReward(state) {
    const { baseReward, maxReward, moves, mineCount } = state;
    // More moves and higher difficulty = higher reward
    const progress = Math.min(1, moves / (state.boardSize * state.boardSize - mineCount));
    const reward = Math.floor(baseReward + (maxReward - baseReward) * progress);
    return reward;
}
