import * as Discord from "discord.js";

const token = require("../authorization").discord.token;
const client: Discord.Client = new Discord.Client();

client.login(token);
export {client};