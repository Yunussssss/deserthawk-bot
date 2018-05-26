const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const DBL = require("dblapi.js");
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQyMTMwMzE3Mjc2Njg5MjA1MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNTIxNDYyNzY5fQ.aguiyAcKshhVNC763tlsTGSZsYA7W7wW1HSj10_WRj0', client);
require('./util/eventLoader')(client);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.on('ready', () => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Aktif, Komutlar yüklendi!`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: ${client.user.username} ismi ile giriş yapıldı!`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Oyun ismi ayarlandı!`);
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] BOT: Şu an ` + client.channels.size + ` adet kanala, ` + client.guilds.size + ` adet sunucuya ve ` + client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString() + ` kullanıcıya hizmet veriliyor!`);
  client.user.setActivity('d!yenilikler | d!yardım | deserthawkbot.xyz', { type: "LISTENING"});  
});

client.on('ready', () => {
    setInterval(() => {
        dbl.postStats(client.guilds.size);
        console.log("DBL istatistikleri güncellendi.");
    }, 300000); 
});

//client.on('message', msg => {
  //if (msg.content.toLowerCase() === 'sa') {
       // setTimeout(() => {
     // msg.react('🇸');
   // }, 1000);
           // setTimeout(() => {
     // msg.react('🇦');
   // }, 1500);
    //msg.reply('Aleyküm Selam!');
  //}
//});

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

client.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(ayarlar.prefix)) return;

  let command = message.content.split(' ')[0];
  command = command.slice(ayarlar.prefix.length);

  let args = message.content.split(' ').slice(1);

  if (command === 'topla') {
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p+c);
    message.channel.sendMessage(`${total}`);
  }
  if (command === 'çıkar') {
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p-c);
    message.channel.sendMessage(`${total}`);
  }
  if (command === 'çarp') {
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p*c);
    message.channel.sendMessage(`${total}`);
  }
  if (command === 'böl') {
    let numArray = args.map(n=> parseInt(n));
    let total = numArray.reduce( (p, c) => p/c);
    message.channel.sendMessage(`${total}`);
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'd!desteksunucusu') {
    msg.channel.send(':inbox_tray: Destek sunucusuna katılmak için "https://discord.gg/Xc5c6gs" adresine tıklayabilirsiniz.');
  }
});

//client.on('message', msg => {
  //if (msg.content.toLowerCase() === 'd!reklamengelle') {
    //msg.channel.send(':white_check_mark: Başarıyla reklam engelleme özelliği aktifleştirildi. Bu özellik "**Kullanıcıları Yasakla**" yetkisi olanlarda çalışmayacaktır. Bundan sonra `Discord sunucu davetleri`, `Facebook linkleri`, `YouTube linkleri`, `Dailymotion linkleri` ve `Google linkleri` gibi linkler engellenecek!');
  //}
//});

//client.on('message', msg => {
  //if (msg.content.toLowerCase() === 'd!küfürkoruması') {
    //msg.channel.send(':white_check_mark: Başarıyla küfür engelleme özelliği aktifleştirildi. Bu özellik "**Kullanıcıları Yasakla**" yetkisi olanlarda çalışmayacaktır. Bundan sonra kanalda edilen küfürler engellenecek; lütfen bottan mesajları yönet yetkisini kaldırmayın!');
  //}
//});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'd!discordbots') {
    msg.channel.send('DesertHawk botunun` discordbots.org` üzerindeki profilini görmek için aşağıdaki linki kullanabilirsiniz; \n https://discordbots.org/bot/421303172766892052 ');
  }
});

//client.on('message', msg => {
  //if (msg.content.toLowerCase() === 'd!seviye') {
    //msg.channel.send(':warning: Üzgünüm, seviye sistemi botu büyük zararlara uğrattığından dolayı kaldırıldı. Lütfen daha fazla ayrıntı için blogumuzdaki ``(http://deserthawkbot.xyz)`` yazımızı okuyun.');
  //}
//});

client.on('message', msg => {
 if(msg.content.startsWith(prefix + "kurucu")) {
  msg.channel.sendMessage(`**${msg.guild.name}** adlı Discord sunucusunun kurucusu; ${msg.guild.owner} adlı kullanıcıdır.`)
}
});

client.on('message', msg => {
 if(msg.content.startsWith(prefix + "discrim")) {
  msg.channel.sendMessage(`Eklencek!!!`)
}
});

client.on('message', msg => {
 if(msg.content.startsWith(prefix + "çal")) {
  msg.channel.sendMessage(`Müzik dinleyebilmek için https://discordbots.org/bot/421303172766892052 adresinden bota upvote vermelisiniz. (eğer upvote verdiyseniz 1 dakika beklemelisiniz)`)
}
});

client.on('message', msg => {
 if(msg.content.startsWith(prefix + "ekle")) {
  msg.channel.sendMessage(`Botu sunucunuza eklemek, tüm özelliklerinden yararlanmak ve komutlarını ücretsiz bir şekilde kullanmak için aşağıdaki linki kullanabilirsiniz; \n http://bit.ly/DesertHawkDavet`)
}
});

client.on('message', msg => {
 if(msg.content.startsWith(prefix + "afk")) {
  msg.channel.sendMessage(`Eklencek!!!`)
}
});

client.login(ayarlar.token);
