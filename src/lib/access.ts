import delve from "dlv";

export function authorization(access: string | string[]){
    const file = require("../../authorization.json");
    return delve(file, access);
}

export function config(access: string | string[]){
    const file = require("../../config.json");
    return delve(file, access);
}

export function room(access: string | string[]){
    const file = require("../../rooms.json");
    return delve(file, access);
}