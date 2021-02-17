const p = require('phin');
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs');

const settings = {
    min_members: 100,       // higher than
    verification_level: 5,  //lower than
}

const randomcode = (num) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
    let buf = "";
    for(let i = 0; i<num; i++) 
        buf += charset[~~(Math.random() * charset.length)];
    return buf
}

const proxies = async () => {
    return (
        await p("https://api.proxyscrape.com/?request=getproxies&proxytype=http&timeout=10000&country=all&ssl=all&anonymity=all")
    ).body.toString().replace(/\r/gm, '').split('\n')
}

const check = async () => {
    const pr = await proxies();

    setInterval(async () => {
        let agent = new HttpsProxyAgent('http://'+pr[~~(Math.random() * pr.length)]);
        let code = randomcode(6);
        const res = await p({ agent, parse: 'json',
            url: `https://discord.com/api/v8/invites/${code}?with_counts=true`
        }).catch(_ => {return})

        if(!res) return;

        if(res.body.approximate_member_count > settings.min_members 
            && res.body.guild.verification_level < settings.verification_level) {
            let str = `members: ${res.body.approximate_member_count}\n`+
            `verification: ${res.body.guild.verification_level}\n`+
            `code: discord.gg/${code}\n`+
            `name: ${res.body.guild.name}\n`+
            `id: ${res.body.guild.id}\n`;

            if(res.body.inviter) 
                str += `inviter: ${res.body.inviter.username}#${res.body.inviter.discriminator} [${res.body.inviter.id}]\n\n`;
            else str += '\n'
            console.log(str);
            fs.appendFileSync("invites.txt", str);
        } else console.log(res.body, code)
    });
}

for(_ in [0,0,0,0]) {
    check()
}
