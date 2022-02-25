const centra = require('centra')

centra('https://api.hypixel.net/guild?key=160cecbc-9081-4412-8420-b7d9d662469f&player=51006b3451ad40f49fe9d43255840976')
.send()
.then(res => res.json())
.then(console.log)