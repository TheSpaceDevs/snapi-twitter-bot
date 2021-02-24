import { ConsumeMessage } from "amqplib";
import { ChannelWrapper } from "amqp-connection-manager";
import { getRepository } from "typeorm";
import { validate } from "class-validator";

import { twitterClient } from "../models/TwitterClient";
import { Message } from "../models/Message";
import { Tweet } from "../entity/Tweet";
import { NewsSite } from "../entity/NewsSite";

export const handleMessage = async (
  message: ConsumeMessage | null,
  channel: ChannelWrapper
): Promise<void> => {
  let tweetRepository = getRepository(Tweet);
  let newsSiteRepository = getRepository(NewsSite);

  if (message) {
    const msg = new Message(JSON.parse(message.content.toString()));

    // Making sure we're working with a valid message
    const messageValidation = await validate(msg);

    if (messageValidation.length !== 0) {
      return console.error(messageValidation);
    }

    // Check if we already have this message, based on the title
    const tweet = await tweetRepository.findOne({ title: msg.title });

    if (!tweet) {
      // We need to get the news site that's needed to pass to the tweet entity
      const newsSite = await newsSiteRepository.findOne({
        newsSiteId: msg.newsSite,
      });

      if (newsSite) {
        const newTweet = new Tweet(msg.title, newsSite, msg.url);

        // Send tweet to Twitter
        twitterClient.sendTweet(
          "article",
          newTweet.title,
          newTweet.newsSite.name,
          newTweet.url
        );

        // Save tweet to the database and ack the message to the broker
        // await tweetRepository.save(newTweet);
        console.log(`Saved: ${newTweet.title} to the database`);
        // channel.ack(message);
      }
    }

    // If we get here, that means the tweet was already found in the database, so we can delete the message
    // channel.ack(message);
  }
};
