/*
cutymeo here, finally made a new bot in 2022.
Structure is probably better than old epic bot.
Though do not use a folder yet.
*/
const { Client, Intents } = require('discord.js');
const axios = require('axios');
const http = require('http');
const url = require('url');

const cookie = process.env.LBCookie;
const token = process.env.BotToken;
const prefix = ";";

const canWhitelist = true;
const whitelistBypass = [915410908921077780, 849118831251030046];

function ExtractStringByBrackets(document, leftBracket, rightBracket, maxLength) // Extracted from Hosted UnlockedInsertService.
{
  document = String(document);
  var indice1 = document.indexOf(leftBracket);
  var indice2 = indice1 + leftBracket.length;
  var indice3 = document.indexOf(rightBracket, indice2);
  if (indice1 == -1 || indice3 == -1 || indice3 - indice2 > maxLength)
    throw "Cannot find the bracketed string.";
  return document.substr(indice2, indice3 - indice2);
}

function whitelistAsset(assetId) {
    return new Promise((resolve, reject) => {
        axios({
            url: "https://auth.roblox.com/v1/logout",
            method: "POST",
            headers: {
                "cookie": `.ROBLOSECURITY=${cookie}`
            }
          }).catch(res => {
            const xcsrf = res.response.headers["x-csrf-token"];
            axios({
              url: "https://roblox.com/library/" + assetId,
              method: "GET",
              headers: {
                "cookie": `.ROBLOSECURITY=${cookie}`
              }
            })
              .then(async res => {
                const ownedItem = res.data.indexOf("This item is available in your inventory.") != -1 || res.data.indexOf("Item Owned") != -1;
                const productId = ExtractStringByBrackets(res.data, `data-product-id="`, `"`, 64);
    
                if (!ownedItem) {
                  axios({
                    url: `https://economy.roblox.com/v1/purchases/products/${productId}`,
                    method: "POST",
                    headers: {
                        "cookie": `.ROBLOSECURITY=${cookie}`,
                        "x-csrf-token": xcsrf,
                    },
                    data: {
                      expectedCurrency: ExtractStringByBrackets(res.data, `data-expected-currency="`, `"`, 64),
                      expectedPrice: ExtractStringByBrackets(res.data, `data-expected-price="`, `"`, 64),
                    }
                  })
                    .then(res => { resolve(`ID ${assetId} successfully whitelisted!`)})
                    .catch(res => reject(`Failed to whitelist, error code: ${res.response != null ? res.response.status : "Unknown. Token got changed?"}`))
                } else resolve(`${assetId} is already whitelisted.`);
              })
              .catch(res => {reject(`Failed to fetch information, error code: ${res.response.status}`)})
          })
    })
}

http.createServer(function (req, res) {
    var parsedUrl = url.parse(request.url, true);
    var query = parsedUrl.query;

    switch (parsedUrl.pathname) {
        case "/whitelist":
            if (query.id && parseInt(query.id) != NaN) {
                whitelistAsset(query.id)
                .then((msg) => {
                    res.write(msg);
                    res.writeHead(200);
                })
                .catch((msg) => {
                    res.write(msg);
                    res.writeHead(400);
                })
            } else {
                res.write("missing id");
                res.writeHead(400);
            }
        default:
            res.write("bot for lb, it do whitelist stuff which is cool and all");
            res.writeHead(200);
    }
    res.end();
}).listen(8080);
new http.Agent({
  keepAlive: true,
  maxSockets: 1,
  keepAliveMsecs: 15000
})

const BotClient = new Client({ partials: ["CHANNEL"], intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING ] });
    
    BotClient.once('ready', () => {
      console.log('LB Whitelist Bot: Active.')
      BotClient.user.setPresence({
        status: 'online',
        activities: [{
          name: `Prefix: ${prefix} | Waiting for whitelisting. Made by cutymeo!`,
          type: 'PLAYING',
          url: 'https://www.twitch.tv/monstercat'
        }]
      })
    });

    BotClient.on('messageCreate', async (message) => {
      if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        if (commandName == "whitelist") {
					if (!canWhitelist && whitelistBypass.indexOf(message.author.id) == -1) {
						console.log(`${commandName} failed for ${message.author.id}: Whitelist is disabled for user`);
						return message.reply(`Cannot whitelist: Automatic whitelisting is disabled for the time being.`);
					}
					if (!process.env.AWS_REGION || process.env.AWS_REGION.search("ap") == -1) {
						console.log(`${commandName} failed for ${message.author.id}: Bot in incorrect region`);
						return message.reply(`Bot is in incorrect region. Please notify the bot developer to reboot. Until then, you cannot whitelist.`);
					}
          if (args[0] && parseInt(args[0]) != NaN) {
            // Will now attempt to automatically whitelist
	        console.log(`${commandName} begin processing for ${message.author.id}`);
            whitelistAsset(args[0])
            .then((msg) => {
                console.log(`${commandName} finished for ${message.author.id} message = ${msg}, ID = ${args[0]}`);
                message.reply(msg);
            })
            .catch((msg) => {
                console.log(`${commandName} failed for ${message.author.id} message = ${msg}, ID = ${args[0]}`);
                message.reply(msg);
            })
            
          } else message.reply("Either there's no argument or it's not a number!");
        } else if (commandName == "test") message.reply("Hello! I'm alive!");
      }
    })

    // Login.
    BotClient.login(token);
