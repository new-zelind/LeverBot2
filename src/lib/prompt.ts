import {addOneTimeMessageHandler} from "./message";
import {DMChannel, Message} from "discord.js";

//ask question and wait for response from user
function ask(question: string, channel: DMChannel) {
  channel.send(question);
  return new Promise<Message>(resolve => {
    addOneTimeMessageHandler(message => {
      if (channel.id !== message.channel.id) return false;
      resolve(message);
      return true;
    });
  });
}

//simple way to ask a string to a user
export function askString(question: string, channel: DMChannel) {
  return ask(question, channel).then(message => message.content);
}

//validator definition
type ValidatorFunction = (
  message: string
) => Promise<boolean | string> | string | boolean;

//simple method to automatically validate inputs from the user
function questionValidate(
  question: string,
  channel: DMChannel,
  validate: ValidatorFunction,
  failureMessage: string
): Promise<string> {
  return askString(question, channel).then(async response => {
    let corrected = await validate(response);
    // If the validator explicity returns true, then return the original resposne
    if (corrected === true) {
      return response;
    }
    // Else if the validator returns a string which coerces to true, the return the corrected string
    if (corrected) {
      return corrected;
    }
    // Else, the validator failed. Print the failureMessage, and start again
    channel.send(failureMessage);
    return questionValidate(question, channel, validate, failureMessage);
  });
}

//for when the user must select different options
async function choose(
  question: string,
  options: string[],
  channel: DMChannel,
  failureMessage = "I can't quite understand what you said. Try again, please."
):Promise<number> {
  options = options.map((i) => i.toUpperCase());
  const prompt = `${question}\n*${options.join("\n")}*`;
  const response = await (await askString(prompt, channel)).toUpperCase();

  if(options.includes(response)) return options.indexOf(response);
  else{
    await channel.send(failureMessage);
    return choose(question, options, channel, failureMessage);
  }
}

export { ask, askString as question, questionValidate, choose };