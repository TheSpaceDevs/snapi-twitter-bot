import amqp from "amqp-connection-manager";
import { ConfirmChannel, ConsumeMessage } from "amqplib";
import "reflect-metadata";
import { createConnection, getRepository } from "typeorm";

import {Tweet} from "./entity/Tweet";
import {NewsSite} from "./entity/NewsSite";
import {twitterClient} from "./models/TwitterClient";
import newsSitesJson from './news_sites.json'

// Create a main function so we can use async/await
async function main() {
  try {
    // Connect to the database
    await createConnection({
      type: "sqlite",
      database: "./database.db",
      entities: [Tweet, NewsSite], // Manually add entities, it's just a few
      synchronize: true,
      logging: false
    });

    // Setup some repositories we need
    let tweetRepository = getRepository(Tweet);
    let newsSiteRepository = getRepository(NewsSite);

    //

    // Import all sites from newsSites.json. This was dumped from the Spaceflight News API database
    for (const entry of newsSitesJson) {
      const site = await newsSiteRepository.findOne({newsSiteId: entry._id['$oid']})
      if (!site) {
        console.log("adding:", entry.name)
        let newsSite = new NewsSite(entry.name, entry._id['$oid']);
        await newsSiteRepository.save(newsSite);
      }
    }

    // Connect to the broker
    const connection = amqp.connect([process.env.AMQP_URL ?? '']);

    // Create a channel and add listeners
    const channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => {
        channel.consume("twitter.articles", handleArticles);
      },
    });

    // Listen for messages, Tweet them and save a reference in the database
    const handleArticles = async (message: ConsumeMessage | null): Promise<void> => {
      if (message) {
        const msg = JSON.parse(message.content.toString());

        // Check if we already have this message, based on the title
        const tweet = await tweetRepository.findOne({title: msg.title})

        if (!tweet) {
          // We need to get the news site that's needed to pass to the tweet entity
          const newsSite = await newsSiteRepository.findOne({newsSiteId: msg.newsSite})

          if (newsSite) {
            const newTweet = new Tweet(msg.title, newsSite, msg.url);

            // Send tweet to Twitter
            twitterClient.sendTweet('article', newTweet.title, newTweet.newsSite.name, newTweet.url)

            // Save tweet to the database and ack the message to the broker
            await tweetRepository.save(newTweet);
            console.log(`Saved: ${newTweet.title} to the database`);
            // channelWrapper.ack(message);
          }
        }

        // If we get here, that means the tweet was already found in the database, so we can delete the message
        channelWrapper.ack(message);
      }
    };
  } catch (e) {
    console.error(e);
  }
}

// Run the app
main().then();
