import Database from 'better-sqlite3';
const db = new Database('C:/Users/Ayaan/AppData/Roaming/OpenBot Dev/openbot.db', {readonly: true});
console.log('hosts:', JSON.stringify(db.prepare('SELECT id, name FROM hosts LIMIT 5').all()));
console.log('discord_guilds:', JSON.stringify(db.prepare('SELECT id, name, enabled, state FROM discord_guilds LIMIT 5').all()));
