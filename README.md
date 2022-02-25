# hypixel-utils

This is a set of scripts I created to help manage
and view information and stats about users and
guilds, primarily to help me manage my own guild.

It's not fully-featured, but it's enough to easily
track member stats, including uuid, rank, join date,
daily and weekly gexp contributions, and overall
guild quest contributions from a member. You can also
download full user stats and search through the json
data if you want (manually, for now).

## Installation

1. Install [Node.js](https://nodejs.org/en/download/)
2. Install [Git](https://git-scm.com/downloads)
3. Clone this repository
```sh
# installation commands
git clone https://github.com/Zytekaron/hypixel-utils
cd hypixel-utils

# update command - run this inside the hypixel-utils directory
git pull
```

If you modify the source code, make sure you stash
your changes before running `git pull` to allow Git
to overwrite all of the changed files.
```
git add .
git stash
```

## Usage

### Setting up your API key

1. Run `/api new` in the Hypixel server
2. Create `.env` and insert these contents
```
HYPIXEL_API_KEY=<your api key>
```

### Setting default values

Add these to your `.env` if you want to set
a defaults for running scripts.
```env
DEFAULT_GUILD_ID=61f08dc58ea8c9e2035c599c
DEFAULT_GUILD_NAME=DevNerds
DEFAULT_USERNAME=Zytekaron
```

### Downloading guild and user data

```sh
mkdir -p data/guilds

node dl-guild [query] # https://api.hypixel.net/guild?<query>
node dl-guild # downloads the default guild data
node dl-guild name=DevNerds
node dl-guild id=61f08dc58ea8c9e2035c599c
```
Information about the guild is now available in `./data/guilds/<guildname>.json`

```sh
mkdir -p data/users

node dl-user [username]
node dl-user # downloads the default user data
node dl-user Zytekaron
```
Information about the user is now available in `./data/users/<username>.json`


### Sifting through guild data with the program

Make sure you've downloaded the data first, then try these:
```sh
node sift-guild [guild-name] [stats|members] # default mode = members

node sift-guild          # shows members for the default guild
node sift-guild DevNerds # shows members for the DevNerds guild

node sift-guild "" stats       # shows stats for the default guild
node sift-guild DevNerds stats # stows stats for the DevNerds guild
```
The first time you run the command, it will take a little longer. (but < 30s)
This is because member's usernames are being fetched from the Mojang API.
Usernames are cached after the first run, so it should now run much faster.

### Other things

The `uuid-cache.json` file is created when you run `dl-user` and `sift-guild`
to reduce strain on the Mojang API when you're running commands frequently.
You will want to periodically delete this file (before using the program again
after a long period of time) to ensure usernames of guild members are up-to-date.

## Advanced Usage

### Sorting Members

By default, members are sorted by their rank, then by their weekly guild xp contribution.
You can change this by modifying the `sorted` constant in `function programMembers`, and
calling these: `byRank` `byJoined` `byDailyXP` `byWeeklyXP` `byChallenges` `byUsername`.
You must call these functions when passing them into the `combine` function. By default,
these functions sort in ascending order, but you can pass in `-1` to reverse it.
```js
// high usernames last (a-z)
const sorted = data.sort(combine(
    byUsername(),
));
// high ranks first, high challenges first
const sorted = data.sort(combine(
    byRank(-1),
    byChallenges(-1),
));
// high ranks first, high usernames first (z-a)
const sorted = data.sort(combine(
    byRank(-1),
    byUsername(),
));
```

## TODO

- Ability to sift through user data with the program
- Commands to update all existing data files - `update-guilds` `update-users` `update-all`

## License

hypixel-utils is licensed under the [MIT Licence](./LICENSE)
