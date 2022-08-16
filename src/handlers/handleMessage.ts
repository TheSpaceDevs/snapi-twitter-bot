import { ConsumeMessage } from "amqplib";
import { ChannelWrapper } from "amqp-connection-manager";
import { captureException, captureMessage } from "@sentry/node";

import { AppDataSource } from "../database";
import { twitterClient } from "../utils/TwitterClient";
import { Message } from "../models/Message";
import { Tweet } from "../entity/Tweet";
import { NewsSite } from "../entity/NewsSite";

export const handleMessage = async (
  message: ConsumeMessage | null,
  channel: ChannelWrapper
): Promise<void> => {

  const msg = new Message(message);
  const validMessage = await msg.validate();

  if (validMessage) {
    // Check if we already have this message, based on the title
    const tweet = await AppDataSource.manager.findOneBy(Tweet, { title: msg.title });

    if (!tweet) {
      // We need to get the news site that's needed to pass to the tweet entity
      const newsSite = await AppDataSource.manager.findOneBy(NewsSite, {
        newsSiteId: msg.newsSite,
      });

      if (newsSite) {
        const newTweet = new Tweet(msg.title, msg.type, newsSite, msg.url);

        try {
          // We try to save first to the database so that if that fails, the run stops and nothing is tweeted
          await AppDataSource.manager.save(newTweet);
          await twitterClient.sendTweet(newTweet);
          console.log(`Saved: "${newTweet.title}" to the database 👍`);
          channel.ack(message!);
        } catch (e) {
          channel.nack(message!, false, true);
          captureException(e);
          console.error(e);
        }
      }
    }

    // If we get here, that means the tweet was already found in the database, so we can delete the message
    channel.nack(message!, false, false);
  } else {
    // We get here if the message didn't validate for some reason
    channel.nack(message!, false, false);
    captureMessage(`Validation error for ${msg.title}`);
    console.error(msg.validationErrors);
  }
};
