import { ConsumeMessage } from "amqplib";
import { ChannelWrapper } from "amqp-connection-manager";
import { getRepository } from "typeorm";

import { twitterClient } from "../models/TwitterClient";
import { Message } from "../models/Message";
import { Tweet } from "../entity/Tweet";
import { NewsSite } from "../entity/NewsSite";

export enum ArticleTypes {
  "Article" = "article",
  "Blog" = "blog",
  "Report" = "report",
}

export const handleMessage = async (
  message: ConsumeMessage | null,
  channel: ChannelWrapper,
  type: ArticleTypes
): Promise<void> => {
  let tweetRepository = getRepository(Tweet);
  let newsSiteRepository = getRepository(NewsSite);

  const msg = new Message(message);
  const validMessage = await msg.validate();

  if (validMessage) {
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
          type,
          newTweet.title,
          newTweet.newsSite.name,
          newTweet.url
        );

        // Save tweet to the database and ack the message to the broker
        try {
          await tweetRepository.save(newTweet);
          console.log(`Saved: "${newTweet.title}" to the database 👍`);
          channel.ack(message!);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // If we get here, that means the tweet was already found in the database, so we can delete the message
    channel.ack(message!);
  } else {
    // We get here if the message didn't validate for some reason
    console.error(msg.validationErrors);
  }
};
