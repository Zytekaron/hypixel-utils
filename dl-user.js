require('dotenv').config();

const { writeFileSync } = require('fs');
const { HypixelClient } = require('node-hypixel.js');
const client = new HypixelClient(process.env.HYPIXEL_API_KEY);

const id = process.argv[2] || process.env.DEFAULT_USERNAME;
if (!id) {
    console.log('id must be provided');
    process.exit(1);
}

(async () => {
    const { player } = await client.getPlayerByDisplayname(id);

    const file = `./data/users/${player.displayname}.json`;
    writeFileSync(file, JSON.stringify(player, null, 4));

    console.log('Saved data to', file);
})();
