import delve from "dlv";

/**
 * A function to parse through the authorization file
 * @pre authorization.#access != null
 * @param access: the data to find in the authorization file
 * @return: the data in location autorization.#access
 */
export function authorization(access: string | string[]){
    const file = require("../../authorization.json");
    return delve(file, access);
}

/**
 * A function to parse through the config.json file
 * @pre config.#access != null
 * @param access: the data grouping to find in config.json
 * @return: the data in location config.#access
 */
export function config(access: string | string[]){
    const file = require("../../config.json");
    return delve(file, access);
}

/**
 * A function to parse through the rooms.json file
 * @pre rooms.#access != null
 * @param access: the data to find in the room pairings file
 * @return: the data in location rooms.#access
 */
export function room(access: string | string[]){
    const file = require("../../rooms.json");
    return delve(file, access);
}