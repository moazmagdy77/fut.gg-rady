const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dataDir = path.resolve(__dirname, '..', '..', 'data');

const players = JSON.parse(fs.readFileSync(path.join(dataDir, 'enhanced_players.json'), 'utf-8'));
const maps = JSON.parse(fs.readFileSync(path.join(dataDir, 'maps.json'), 'utf-8'));
const chemStyleMap = maps.chemStyles;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  for (const player of players) {
    player.metaRatings = [];

    if (!player.archetype || !player.eaId) continue;

    for (const archetype of player.archetype) {
      const url = `https://api.easysbc.io/squad-builder/meta-ratings?archetypeId=${archetype}&resourceId=${player.eaId}`;
      console.log(`📦 Fetching meta rating for player ${player.commonName} - Archetype: ${archetype}`);

      try {
        const response = await axios.get(url);
      
        const ratings = Array.isArray(response.data) ? response.data : [];
        if (!ratings.length) {
          console.warn(`⚠️ No ratings found for ${player.commonName} - Archetype: ${archetype}`);
        }
      
        const mappedRatings = ratings.map(r => ({
          ...r,
          chemStyle: chemStyleMap[r.chemstyleId.toString()] || r.chemstyleId
        }));
      
        player.metaRatings.push({
          archetype,
          ratings: mappedRatings
        });
      } catch (err) {
        console.error(`❌ Failed for ${player.commonName} with archetype ${archetype}:`, err.message);
      }

      // To avoid rate limiting
      await delay(250);
    }
  }

  fs.writeFileSync(path.join(dataDir, 'players_with_meta.json'), JSON.stringify(players, null, 2));
  console.log('✅ Finished saving players_with_meta.json');
})();