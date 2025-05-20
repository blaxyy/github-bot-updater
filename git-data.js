const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dataRepoUrl = process.env.DATA_REPO_URL;
const token = process.env.GITHUB_PAT;

if (!dataRepoUrl || !token) {
    console.error('[ERROR] DATA_REPO_URL or GITHUB_PAT not set in .env');
    process.exit(1);
}

const dataRepoPath = path.join(__dirname, '../directory-to-your-bots-data');
const authDataRepoUrl = dataRepoUrl.replace('https://', `https://${token}@`);

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(stderr || stdout);
            else resolve(stdout);
        });
    });
}

let isSyncing = false;

async function syncDataRepo() {
    if (isSyncing) {
        console.log('[Git-Data] Sync already running. Skipping...');
        return;
    }
    isSyncing = true;

    try {
        console.log('[Git-Data] Start Syncing...');

        if (!fs.existsSync(path.join(dataRepoPath, '.git'))) {
            console.log('[Git-Data] Cloning new Data-Repo...');
            await execPromise(`git clone ${authDataRepoUrl} ${dataRepoPath}`);
        } else {
            console.log('[Git-Data] Checking for Updates...');
            await execPromise(`git -C ${dataRepoPath} remote set-url origin ${authDataRepoUrl}`);
            await execPromise(`git -C ${dataRepoPath} fetch origin`);
            const status = await execPromise(`git -C ${dataRepoPath} status -uno`);
            
            if (status.includes('behind')) {
                console.log('[Git-Data] Changes found. Pulling...');
                await execPromise(`git -C ${dataRepoPath} pull origin main`);
            } else {
                console.log('[Git-Data] No changes found.');
            }
        }

        const localChanges = await execPromise(`git -C ${dataRepoPath} status --porcelain`);
        if (localChanges.trim().length > 0) {
            console.log('[Git-Data] Local changes found. Pushing...');
            await execPromise(`git -C ${dataRepoPath} add .`);
            await execPromise(`git -C ${dataRepoPath} commit -m "Auto-sync: ${new Date().toISOString()}"`);
            await execPromise(`git -C ${dataRepoPath} push`);
        }

        console.log('[Git-Data] Sync done.');
    } catch (error) {
        console.error('[Git-Data] Error:', error);
    } finally {
        isSyncing = false;
    }
}

module.exports = { syncDataRepo };
