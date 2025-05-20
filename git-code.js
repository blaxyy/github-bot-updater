const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
require('dotenv').config();

const codeRepoUrl = process.env.CODE_REPO_URL;
const token = process.env.GITHUB_PAT;
const currentHost = os.hostname();
const allowedHost = 'name-of-your-host-device';

if (!codeRepoUrl || !token) {
    console.error('[ERROR] CODE_REPO_URL or GITHUB_PAT not set in .env');
    process.exit(1);
}

const codeRepoPath = path.join(__dirname, '../directory-to-your-bots-code');
const authCodeRepoUrl = codeRepoUrl.replace('https://', `https://${token}@`);

function execPromise(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(stderr || stdout);
            else resolve(stdout);
        });
    });
}

let isSyncing = false;

async function syncCodeRepo() {
  //You can comment this out, if you want the bot to go through the process
    if (currentHost !== allowedHost) {
        console.log('[INFO] Code synchronization skipped: Not running on the allowed device.');
        return;
    }

    if (isSyncing) {
        return;
    }
    isSyncing = true;

    try {
        console.log('[Git-Code] Starting Code-Sync...');

        if (!fs.existsSync(path.join(codeRepoPath, '.git'))) {
            console.log('[Git-Code] No Repo found. Cloning...');
            await execPromise(`git -C ${codeRepoPath} init`);
            await execPromise(`git -C ${codeRepoPath} remote add origin ${authCodeRepoUrl}`);
            await execPromise(`git -C ${codeRepoPath} fetch origin`);
            await execPromise(`git -C ${codeRepoPath} reset --hard origin/main`);
        } else {
            console.log('[Git-Code] Check for local changes...');
            await execPromise(`git -C ${codeRepoPath} remote set-url origin ${authCodeRepoUrl}`);
            await execPromise(`git -C ${codeRepoPath} fetch origin`);

            const localChanges = await execPromise(`git -C ${codeRepoPath} status --porcelain`);
            if (localChanges.trim()) {
                console.log('[Git-Code] Local changes detected:\n' + localChanges);

              //Another host check
                if (currentHost === allowedHost) {
                    console.log('[Git-Code] Host is valid. Resetting with "reset --hard HEAD"...');
                    await execPromise(`git -C ${codeRepoPath} reset --hard origin/main`);
                } else {
                    console.log('[Git-Code] Host is not valid. No action taken.');
                }
            } else {
                console.log('[Git-Code] No local changes.');
            }

            const status = await execPromise(`git -C ${codeRepoPath} status -uno`);
            if (status.includes('behind')) {
                console.log('[Git-Code] Found changes on remote. Pulling...');
                await execPromise(`git -C ${codeRepoPath} pull origin main`);
            } else {
                console.log('[Git-Code] No changes on remote.');
            }
        }

        console.log('[Git-Code] Code-Repo synchronised.');
    } catch (error) {
        console.error('[Git-Code] Error:', error);
    } finally {
        isSyncing = false;
    }
}

module.exports = { syncCodeRepo };
