# github-bot-updater

Hello everyone, this is a easy backup and update setup for your discord bot that I have been working on first for myself, but now I decided to share it to everyone. The same as this process helps me maintain my bot up-to-date, the same way it should do it for you too. This updater can update in different periods of time, so feel free to change it.

## **Disclaimer**
Before we continue in the short explanation of this updater/code I want to warn you **to not give away your passwords, tokens etc on here.** If you really want to follow this guide, **I recommend to you creating a throwaway GitHub Account** with all your code/data stored in a private repository **with a password noone can guess** (best case scenario if you use a generated password). **If you share any data it's not my responsibility.**

## Setting up the updater
**Note:** In this guide it's assumed that you have installed the git package on your device (for example via npm) and that you have set your "global.user" and "global.email", without that you might get into errors.

First you create a folder of your choice (preferably "Bot-git") and install dotenv as a package inside of it. After that you can download the files from this repository (except "git-updater.js") to the folder and change the values for your repositories and tokens.

Now you put it inside a whole folder with the folder containing your bot code and bot data (assuming these are already uploaded and connected to a git repository). It should look like this for example:

![image](https://github.com/user-attachments/assets/b6669754-9581-49b1-ad20-42ea4dafa322)

Next important step: you need to have the "git-updater.js" file inside of the bot code folder, which is essential for the files to work.

**Important:** check the directory paths inside of the files to not wipe out any data on accident.

Last step, import the "git-updater.js" file and run it in your main file of your bot (you can name it "main.js" or "bot.js" or whatever) by simply copy pasting the following lines:

```
const { checkAndUpdate } = require('./git-updater.js');  // Import the correct path of the file destination!

checkAndUpdate().then(() => {
    console.log('[INFO] Bot and data repositories are up-to-date. Starting bot...');
}).catch(error => {
    console.error('[ERROR] Update process failed. Starting bot anyway...', error);
});
```

# Outro

If you need help or have any questions feel free to write me a message or open up a issue. If you found this code and mini tutorial useful I would appreciate if you could buy me a coffee: https://ko-fi.com/blaxyy
