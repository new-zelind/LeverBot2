Want A Bot to Call Your Own?
============================
This guide will guide you through creating your own instance to run.

## Step 1: Secure Dependencies
Ensure that you have successfully installed the following:
* Node.js (v 14.0.0 or above):
  * Not sure if you have Node installed? Run `node -v` in your terminal. If nothing pops up, you can install Node.js from [here](https://nodejs.org/en/).
  * Note: make sure you install the current version and add Node to your PATH variable. For a guide on how to do the latter, visit [here](https://helpdeskgeek.com/windows-10/add-windows-path-environment-variable/).
  * You should also be able to run the `npm -v` command.

## Step 2: Create A Testing Server
It's a good idea to make a Discord server with you and your bot so you can test it out. Create a new Discord server and call it whatever you want. Be sure to add the following channels:
* #verification
* #appeals
* #member-approval
* #server-log
* #event-log
* #bot-commands
* #wall-of-fame

It's very important that these channels are added. Some functionality may be lost if you fail to do so!

## Step 3: Create a Discord Bot Token
You'll need to register and create a bot user through the Discord Developer Portal. A Discord login is required.
* Go to the [DDP here](https://discord.com/developers/applications/) and log in, if necessary.
* Click the "New Application" button next to your profile picture in the top right corner.
* In the "Name" box, put in a name for your new bot. You can name it ByrnesBot, or LeverBot, or whatever suits you. Then click "Create". Congrats! You registered a bot user - now you need to activate it.
* In the menu on the left-hand side of the screen, click the "Bot" icon with the puzzle piece. On the other side of the screen, click the "Add Bot" button, and follow through with the confirmation message. You have now activated your bot.

## Step 4: Get The Bot Onto Your Server
Now we're going to invite the bot onto your testing server and establish the correct permissions.
* Click on the "OAuth2" button with the wrench in the left-hand-side menu.
* In the "Scopes" box, click "bot". In the "Bot Permissions" box, check "Administrator." At the bottom of the "Bot" box is a `discord.com` URL. Copy it and paste it into a new browswer tab.
* In the dropdown menu, select your the server you made in Step 2. Then click "Continue." Ensure that the "Administrator" box is checked in the confirmation menu, then click "Authorize" and complete the Captcha to invite the bot to your server.

## Step 5: Fork the LeverBot2 Repo
Now your bot needs some code. Lucky enough, I have some.
* Fork the LeverBot2 repository to your profile.
* Go back to your terminal and create a new directory to hold the bot code. Navigate into this directory.
* `git clone` the code from the new repository into your local directory.
* Open the `authexample.json` file. Now navigate back to the Developer Portal, under the "Bot" tab of your bot. You should see a section called "Token." Click on the blue text to reveal your bot's token, then click "Copy" to copy the bot's token. DO NOT SHARE THIS TOKEN WITH ANYONE!!!!!!! Paste this token into `authexample.json` next to the "token" definition.
* Next, navigate to Discord and ensure that you have Developer Mode enabled in settings. Right click your username, then click the button that says "Copy ID". Paste this string of numbers next to the "owner" definition. Save the file and close it.
* Now run the command `mv authexample.json authorization.json` to rename the file.

## Step 6: Last Few Steps
We're getting close to a running bot.
* Navigate to `/src/lib/command.ts` and locate line 11. This is where the bot's prefix to invoke commands is defined. The default prefix is `$`, but you can change it to any non-alphanumeric character (e.g. `!`, `#`, `.`, `~`, etc.).
* In that same file, navigate to line 207, under `Permissions`. Put your User ID that you copied earlier in the place of the User ID currently there.
* Next, naviate back to the `/LeverBot2/` directory and run the command `npm i`. This will install all dependencies needed in a directory called `/node_modules/`.
* Now you should be ready to roll! Run the command `npx tsc` to compile the code into an `/out/` directory, then run `node out/main.js` to start up the bot. You should see a confirmation message in the terminal if it works correctly! Try sending `[your_prefix_here]ping` in your test server.

## Step 7: File Structure
Before you start diving in, there's a few housekeeping items we need to go over.
* There's three main directories within `/src/`:
   * `/cmd/`: This houses all of the commands that server members can invoke.
   * `/lib/`: This directory contains the LeverBot2 Library and provides all of the useful functions and interfaces the bot uses throughout its code. It is not recommended to edit or remove these files (unless you really know what you're doing).
   * `/passive/`: These files contain all of the behaviors that the bot runs in the background, such as message handling, verification, and the Wall of Fame.
* Whenever you make a new command, put the main command file, and any supporting files, in the `/cmd/` directory. Any passive or background behaviors that do not require a command invocation should be put in the `/passive/` directory.

## Step 8: Adding Commands
The command structure developed by MayorMonty makes it super easy to add a new command to the bot.
* Each command on the bot is actually an instance of a `Command` interface found in `/src/lib/command.ts`. These commands require five items:
   * `names`: The name(s) that can be used to invoke the command.
   * `documentation`: The documentation section contains a short description of the command, example syntax, and the grouping of the command for the `help` command.
   * `check`: Certain commands may be restricted to certain users, channels, or roles. You can see an example of all the Permissions and their descriptions under the `Permissions` object in `command.ts`.
   * `async fail()`: This is what the bot does if the invoker fails the Permissions check listed above.
   * `async exec()`: Put the actual command code here.
* You can dig through the existing files in `/cmd/` to see examples of how to do this. Make sure you `export` your commands and set them to `default`!
* Once you add a new command, be sure to add an `import` statement in `/cmd/index.js` for each command you create. Otherwise, the bot won't know it exists.

## Questions? Issues? Bugs?
If you have any questions about development, feel free to add me on Discord: `Segfault#2289`. You can also consult the Discord.js documentation [here](https://discord.js.org/#/docs/main/stable/general/welcome) for more information. If you find any bugs or issues with the existing code, please file an Issue report [here](https://github.com/new-zelind/LeverBot2/issues). If you come up with something really, really cool that you think should be added to the bot, go ahead and make a pull request! Be sure you rebase and squash your commits before you do - it'll make things easier for both of us.

I'm excited to see what other people come up with! Happy coding, and good luck!
*- Zach*
