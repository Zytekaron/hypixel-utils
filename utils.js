const { writeFileSync } = require("fs");

const cacheFile = './uuid-cache.json';

module.exports = {
    loadCache() {
        try {
            const json = require(cacheFile);
            return new Map(Object.entries(json));
        } catch (err) {
            // file doesn't exist / malformed content
            return new Map();
        }
    },
    writeCache(cache) {
        const json = Object.fromEntries(cache);
        const str = JSON.stringify(json, null, 4);
        writeFileSync(cacheFile, str);
    }
};
