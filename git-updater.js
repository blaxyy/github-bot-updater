const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const os = require('os');

const currentHost = os.hostname();
const allowedHost = 'your host name';

const { syncCodeRepo } = require('../path-to/git-code');
const { syncDataRepo } = require('../path-to/git-data');

const syncInterval = 20;  // Interval in minutes

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || stdout);
            } else {
                resolve(stdout);
            }
        });
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkAndUpdate() {
    try {
        console.log('[INFO] Starting update process...');
        await syncCodeRepo();
        await delay(3000);
        await syncDataRepo();
        await delay(3000);
        console.log('[INFO] Update process completed.');
        scheduleNextSync();
    } catch (error) {
        console.error('[INFO] Update process failed.', error);
    }
}

// Function for planning next scheduled update:
function scheduleNextSync() {
    const now = new Date();
    const minutes = now.getMinutes();
    const nextInterval = syncInterval - (minutes % syncInterval);
    const delayTime = nextInterval * 60 * 1000;

    console.log(`[INFO] Next sync scheduled in ${nextInterval} minutes (${new Date(now.getTime() + delayTime).toLocaleTimeString()}).`);

    setTimeout(() => {
        checkAndUpdate();
    }, delayTime);
}

module.exports = { checkAndUpdate };

