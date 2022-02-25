require('dotenv').config();

const centra = require('centra');
const moment = require('moment');
const utils = require('./utils');

const usage = 'node sift-guild [games|members] [statsMode]';

const id = process.argv[2] || process.env.DEFAULT_GUILD_NAME;
if (!id) {
    console.log(usage);
    process.exit(1);
}
const mode = process.argv[3] ?? 'members';
const statsMode = process.argv[4] ?? '1';

// Program functionality

const guild = require(`./data/guilds/${id}.json`);

// sometimes I like to confuse people
const guildRanks = guild.ranks.reduce((obj, rank) => (obj[rank.name] = rank.priority) && obj, {});
guildRanks['Guild Master'] = Infinity;

async function program() {
    switch (mode.toLowerCase()) {
        case 'stats':
            return programStats();
        case 'members':
            return programMembers();
        default:
            console.log(usage);
    }
}

async function programStats() {
    const { guildExpByGameType } = guild;

    console.log('Lifetime Guild XP by Game:');

    const fixName = str => str
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/(^| )\w/gi, str => str.toUpperCase())
        .replace(/UHC|SMP|MCGO/gi, str => str.toUpperCase());

    const sorted = Object.entries(guildExpByGameType)
        .sort((a, b) => b[1] - a[1])
        .map(data => ({
            name: fixName(data[0]),
            xp: data[1]
        }));

    const gamesXP = sorted.filter(game => game.xp > 0)
    for (const game of gamesXP) {
        console.log(fixName(game.name).padEnd(14, ' '), '=>', game.xp);
    }

    const gamesNoXP = sorted
        .filter(game => game.xp == 0)
        .map(game => game.name)
        .join(', ');
    if (gamesNoXP.length > 0) {
        console.log('No XP Earned:', gamesNoXP);
        console.log();
    }


    console.log('Guild Ranks:');
    console.log('PRIORITY NAME');
    const ranks = Object.entries(guildRanks)
        .sort((a, b) => b[1] - a[1]);
    for (const [name, priority] of ranks) {
        if (name == 'Guild Master') {
            console.log('∞', '\t', name);
        } else {
            console.log(priority, '\t', name);
        }
    }
}

async function programMembers() {
    const data = await addFields(guild.members);

    const sorted = data.sort(combine(
        byRank(-1),
        byUsername(),
    ));

    // Format 1
    const pad = '\t';
    if (statsMode == '1') {
        for (const { uuid, rank, joined, username, challenges, dailyGuildXP, weeklyGuildXP } of sorted) {
            const challengesPad = ' '.repeat(3 - challenges.toString().length);
            const dailyXPPad = ' '.repeat(5 - dailyGuildXP.toString().length);
            const weeklyXPPad = ' '.repeat(6 - weeklyGuildXP.toString().length);

            const joinDate = moment(joined).format('L');
            const joinTime = moment(joined).fromNow()
                .replace(/^a/, '1')
                .padEnd(12, ' ');

            const pad = '\t';

            console.log(
                uuid, '=>',
                rank.padEnd(12, ' '),
                username.padEnd(16, ' '), pad,
                'Join Date:', joinDate, pad,
                'Join Time:', joinTime, pad,
                'Quests:', challenges, challengesPad, pad,
                'Daily XP:', dailyGuildXP, dailyXPPad, pad,
                'Weekly XP:', weeklyGuildXP, weeklyXPPad, pad,
            );
        }
    }
    if (statsMode == '2') {
        const r = n => ' '.repeat(n); // repeated space for padding
        console.log(`UUID ${r(27)} => RANK ${r(7)} USERNAME ${r(14)} JOIN DATE ${r(5)} JOIN TIME ${r(5)} QUESTS  DAY XP  WEEK XP`);

        for (const { uuid, rank, joined, username, challenges, dailyGuildXP, weeklyGuildXP } of sorted) {

            console.log(
                uuid, '=>',
                rank.padEnd(12, ' '),
                username.padEnd(16, ' '), pad,
                moment(joined).format('L'), pad,
                moment(joined).fromNow().replace(/^a/, '1'), pad, // extra: .replace(/(^\d[^\d]|days)/g, c => c + ' ')
                challenges, pad,
                dailyGuildXP, pad,
                weeklyGuildXP
            );
        }
    }
}

// Utility functions

async function addFields(members) {
    const data = Array(members.length);
    for (const i in members) {
        const member = members[i];

        const xp = Object.values(member.expHistory);

        data[i] = Object.assign(member, {
            username: await getUsername(member.uuid),
            challenges: member.questParticipation ?? 0,
            dailyGuildXP: xp[0],
            weeklyGuildXP: xp.reduce((acc, cur) => acc + cur, 0),
        });
    }
    return data;
}

function combine(...funcs) {
    return (a, b) => {
        for (const func of funcs) {
            const value = func(a, b);
            if (value != 0) {
                return value;
            }
        }
        return 0;
    }
}

function byRank(mult = 1) {
    return (a, b) => (guildRanks[a.rank] - guildRanks[b.rank]) * mult;
}

function byJoined(mult = 1) {
    return (a, b) => (a.joined - b.joined) * mult;
}

function byDailyXP(mult = 1) {
    return (a, b) => (a.dailyGuildXP - b.dailyGuildXP) * mult;
}

function byWeeklyXP(mult = 1) {
    return (a, b) => (a.weeklyGuildXP - b.weeklyGuildXP) * mult;
}

function byChallenges(mult = 1) {
    return (a, b) => (a.challenges - b.challenges) * mult;
}

function byUsername(mult = 1) {
    return (a, b) => a.username.localeCompare(b.username) * mult;
}

// Cache loader & program runner

const cache = utils.loadCache();
(async () => {
    try {
        await program();
    } catch (err) {
        console.error('program error');
        console.error(err.stack);
    }

    utils.writeCache(cache);
})();

async function getUsername(uuid) {
    if (cache.has(uuid)) {
        return cache.get(uuid);
    }

    const username = await getUsernameAPI(uuid);
    cache.set(uuid, username);
    return username;
}

async function getUsernameAPI(uuid) {
    return centra(`https://api.mojang.com/user/profiles/${uuid}/names`)
        .send()
        .then(res => res.json())
        .then(res => res.pop().name);
}
