const express = require('express');
const axios = require('axios');
const app = express();                                const PORT = 8080;
                                                      app.use(express.json());
app.use(express.static('public'));

const genClientID = () => "7" + Math.floor(1000000 + Math.random() * 8999999);
                                                      // LOGGING LOGIN
app.post('/api/login', (req, res) => {                    const { username } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const clientId = genClientID();                       console.log(`\x1b[33m[LOG WEBSITE]\x1b[0m\nclient-id: ${clientId}\nip: ${ip}\nusername: ${username}\ntype-request: LOGIN_ACCESS\n--------------------------`);
    res.json({ status: true, clientId });
});

// TIKTOK STALKER ENGINE
app.post('/api/stalk', async (req, res) => {
    const { username, clientId } = req.body;
    console.log(`\x1b[36m[LOG WEBSITE]\x1b[0m\nclient-id: ${clientId}\ntarget: ${username}\ntype-request: GET_TIKTOK_DATA\n--------------------------`);
    try {
        const response = await axios.get(`https://www.tiktok.com/@${username}`, { timeout: 15000 });
        const html = response.data;
        if (html.includes('__UNIVERSAL_DATA_FOR_REHYDRATION__')) {
            const jsonStr = html.split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1].split('</script>')[0];
            const data = JSON.parse(jsonStr)["__DEFAULT_SCOPE__"]["webapp.user-detail"];
            const user = data.userInfo.user;
            const stats = data.userInfo.stats;
            const output = `[ ALYA-STALKER TIKTOK ]\nNAME: ${user.nickname}\nID: ${user.id}\nFOLLOWERS: ${stats.followerCount}\nLIKES: ${stats.heartCount}\nBIO: ${user.signature || '-'}\nSTATUS: ${user.privateAccount ? 'PRIVATE' : 'PUBLIC'}\n[!] SUCCESS EXTRACT`;
            res.json({ status: true, output });
        } else { res.json({ status: false, msg: "[-] Rate Limit/Error." }); }
    } catch (e) { res.json({ status: false, msg: "[-] Error: " + e.message }); }
});

// ROBLOX STALKER ENGINE (New)
app.post('/api/roblox', async (req, res) => {
    const { username, clientId } = req.body;
    console.log(`\x1b[35m[LOG WEBSITE]\x1b[0m\nclient-id: ${clientId}\ntarget: ${username}\ntype-request: GET_ROBLOX_DATA\n--------------------------`);
    try {
        // Get User ID
        const userReq = await axios.post("https://users.roblox.com/v1/usernames/users", { usernames: [username], excludeBannedUsers: false });
        if (!userReq.data.data.length) return res.json({ status: false, msg: "[-] Target Roblox not found." });

        const u_id = userReq.data.data[0].id;
        const real_name = userReq.data.data[0].displayName;

        // Multi-Request Data
        const [profile, friends, following, presence] = await Promise.all([
            axios.get(`https://users.roblox.com/v1/users/${u_id}`),
            axios.get(`https://friends.roblox.com/v1/users/${u_id}/friends/count`),
            axios.get(`https://friends.roblox.com/v1/users/${u_id}/followings/count`),
            axios.post("https://presence.roblox.com/v1/presence/users", { userIds: [u_id] })
        ]);

        const lastOnline = presence.data.userPresences[0].lastOnline || "Access Denied";
        const output = `[ ALYA-STALKER ROBLOX ]\n--------------------------\nName: ${real_name}\nId: ${u_id}\nBio: ${profile.data.description || 'Empty'}\nCreation-Date: ${profile.data.created}\nFriend: ${friends.data.count}\nFollowing: ${following.data.count}\nItsBanned: ${profile.data.isBanned}\nVerified: ${profile.data.hasVerifiedBadge}\nLastOnline: ${lastOnline}\n--------------------------\n[!] SUCCESS CEK ROBLOX`;

        res.json({ status: true, output });
    } catch (e) {
        res.json({ status: false, msg: "[-] Roblox API Error: " + e.message });
    }
});

app.listen(PORT, () => {
    console.clear();
    console.log(`\x1b[32m[SYSTEM ACTIVE]\x1b[0m Irfan-Tools v1.0 | http://localhost:${PORT}`);
});
