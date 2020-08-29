import {addOneTimeMessageHandler} from "./message";
import {DMChannel, Message} from "discord.js";

/**
 * A function to ask a user a question in DMs. Don't use this outisde of this
 * file. It breaks a lot of shit.
 * @param question the question to be asked
 * @param channel an instance of target user's DM channel
 * @return resolved Promise<message> iff the question is answered &&
 *            the message is in #channel
 *         unresolved Promise<message> if the next message sent is not in
 *            #channel
 */
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

/**
 * A simple way to ask a string to a user
 * @param question the question to be asked
 * @param channel an instance of the target user's DM channel
 * @return a string containing the user's answer to #question
 */
export function askString(question: string, channel: DMChannel) {
  return ask(question, channel).then(message => message.content);
}

//validator definition
type ValidatorFunction = (
  message: string
) => Promise<boolean | string> | string | boolean;

/**
 * A simple method to automatically validate inputs from the user. You need not
 * worry about using this function.
 * @param question the question to be asked
 * @param channel an instance of the targer user's DM channel
 * @param validate a callback function for validation (see ValidatorFunction above)
 * @param failureMessage the message to send the user if their answer fails validation
 * @return A promise<string> containing the user's answer to #question
 */
function questionValidate(
  question: string,
  channel: DMChannel,
  validate: ValidatorFunction,
  failureMessage: string
): Promise<string> {
  return askString(question, channel).then(async response => {
    let corrected:string | boolean = await validate(response);
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
/**
 * A function for when the user must select between different answers.
 * @param question the question to be asked
 * @param options an array of the user's options
 * @param channel an instance of the targer user's DM channel
 * @param failureMessage the message to send the user if their answer fails validation 
 * @return the index of the user's answer within #options
 */
async function choose(
  question: string,
  options: string[],
  channel: DMChannel,
  failureMessage = "I can't quite understand what you said. Try again, please."
):Promise<number>{

  //prepare all options
  options = options.map((i) => i.toUpperCase());

  //send the user the question and all available options, then get the response
  const prompt:string = `${question}\n*${options.join("\n")}*`;
  const response:string = await (await askString(prompt, channel)).toUpperCase();

  //response validation - recursive upon an invalid response
  if(options.includes(response)) return options.indexOf(response);
  else{
    await channel.send(failureMessage);
    return choose(question, options, channel, failureMessage);
  }
}

export{
  ask,
  askString as question,
  questionValidate,
  choose
};