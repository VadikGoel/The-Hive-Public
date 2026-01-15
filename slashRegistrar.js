const crypto=require('crypto');const{REST,Routes,SlashCommandBuilder}=require('discord.js'),fs=require('fs'),path=require('path'),config=require('./config.json');const _cmd_verify=()=>{const checks=[{test:config.clientId,fail:'NO_CLIENT_ID'},{test:config.clientId!=='1455869965822460015',fail:'TEST_CLIENT_ID'},{test:!config.clientId.includes('YOUR'),fail:'PLACEHOLDER_CLIENT_ID'},{test:config.token,fail:'NO_TOKEN'},{test:!config.token.includes('YOUR'),fail:'PLACEHOLDER_TOKEN'}];for(const c of checks){if(!c.test){console.error(`[SLASH-LOCK] COMMAND REGISTRATION BLOCKED: ${c.fail}`),process.exit(1)}}};const _file_integrity=()=>{const required=['./commands','./slashDefinitions.js','./config.json'];for(const f of required){if(!fs.existsSync(f)){console.error(`[SLASH-INTEGRITY] Missing: ${f}`),process.exit(1)}}};_cmd_verify();_file_integrity();const _anti_tamper=setInterval(()=>{if(!config.clientId||config.clientId.includes('YOUR')||!fs.existsSync('./slashDefinitions.js')){console.error('[ANTI-TAMPER] Code modified!'),process.exit(1)}},6e5);const buildSlashCommands=()=>{const defsPath=path.join(__dirname,'slashDefinitions.js');delete require.cache[require.resolve(defsPath)];let customDefs={};try{customDefs=require('./slashDefinitions.js')}catch(e){console.warn('No custom slash definitions found:',e?.message);
  }
  
  const commandsDir = path.join(__dirname, 'commands');
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
  const slash = [];
  const seen = new Set();
  
  for (const f of files) {
    try {
      const mod = require(path.join(commandsDir, f));
      if (!mod || !mod.name) continue;
      const name = String(mod.name).toLowerCase();
      
      // Skip if already seen (avoid duplicates)
      if (seen.has(name)) {
        console.warn('Duplicate command name skipped for slash:', name, 'from file', f);
        continue;
      }
      seen.add(name);
      
      // Use custom definition if available, otherwise skip (don't add generic "args" option)
      if (customDefs[name]) {
        slash.push(customDefs[name].toJSON());
      } else {
        // Only add generic if command doesn't have custom definition
        // This prevents showing "args:" for commands that should be clean
        console.warn('No slash definition for command:', name, '- skipping from slash commands');
      }
    } catch (e) {
      console.warn('Skipping command for slash build:', f, e?.message);
    }
  }
  return slash;
}

/**
 * Registers slash commands. By default, registers globally. If `guildId` is provided, registers in that guild.
 */
async function registerSlashCommands({clientId,token,guildId}={}){const _final_check=()=>{const invalid=[!clientId||!token,token.includes('YOUR'),!config.token,config.token.includes('YOUR')].some(Boolean);if(invalid){console.error('[REGISTRATION-BLOCK] Invalid credentials - commands cannot register'),process.exit(1)}};_final_check();const rest=new REST({version:'10'}).setToken(token);const commands=buildSlashCommands();if(!clientId)clientId=config.clientId;if(guildId){await rest.put(Routes.applicationGuildCommands(clientId,guildId),{body:commands});return{scope:'guild',count:commands.length}}else{await rest.put(Routes.applicationCommands(clientId),{body:commands});return{scope:'global',count:commands.length}}}const _export_guard=()=>{if(!config.token||config.token.includes('YOUR')||!config.clientId||config.clientId.includes('YOUR')){throw new Error('[EXPORT-GUARD] Cannot export with placeholder credentials')}};_export_guard();module.exports={registerSlashCommands};
