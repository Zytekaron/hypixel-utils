require('dotenv').config();

const { writeFileSync } = require('fs');
const centra = require('centra');

const id = process.argv[2]
    || 'id=' + process.env.DEFAULT_GUILD_ID
    || 'name=' + process.env.DEFAULT_GUILD_NAME;
if (!id) {
    console.log('id must be provided');
    process.exit(1);
}

(async () => {
    const res = await centra('https://api.hypixel.net/guild?' + id)
        .header('API-Key', process.env.HYPIXEL_API_KEY)
        .send();

    const json = await res.json();
    if (!json.success) {
        console.log('Request failed:', json.cause)
        return;
    }

    const file = `./data/guilds/${json.guild.name}.json`;
    writeFileSync(file, JSON.stringify(json.guild, null, 4));

    console.log('Saved data to', file);
})();


