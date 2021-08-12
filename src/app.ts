import amqp from "amqp-connection-manager";
import { ConfirmChannel } from "amqplib";
import "reflect-metadata";
import { createConnection, getRepository } from "typeorm";
import Sentry from "@sentry/node";

import { handleMessage } from "./handlers/handleMessage";
import { Tweet } from "./entity/Tweet";
import { NewsSite } from "./entity/NewsSite";
import newsSitesJson from "./news_sites.json";

// Create a main function so we can use async/await
async function main() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });

  try {
    // Connect to the database
    await createConnection({
      type: "sqlite",
      database: process.env.DB_LOCATION
        ? `${process.env.DB_LOCATION}/snapi-twitter-bot.db`
        : "./snapi-twitter-bot.db",
      entities: [Tweet, NewsSite], // Manually add entities, it's just a few
      synchronize: true,
      logging: false,
    });

    // Setup a newsRepository to handle news stuff here
    let newsSiteRepository = getRepository(NewsSite);

    // Import all sites from newsSites.json. This was dumped from the Spaceflight News API database
    for (const entry of newsSitesJson) {
      const site = await newsSiteRepository.findOne({
        newsSiteId: entry.id,
      });
      if (!site) {
        console.log("adding:", entry.name);
        let newsSite = new NewsSite(entry.name, entry.id);
        await newsSiteRepository.save(newsSite);
      }
    }

    // Connect to the broker
    const connection = amqp.connect([process.env.AMQP_URL ?? ""]);

    // Create a channel and add listeners
    const channelWrapper = connection.createChannel({
      json: true,
      setup: (channel: ConfirmChannel) => {
        return Promise.all([
          channel.assertQueue("twitter"),
          channel.bindQueue("twitter", "importer", "*"),
          channel.consume("twitter", (message) =>
            handleMessage(message, channelWrapper)
          ),
        ]);
      },
    });
  } catch (e) {
    console.error(e);
  }
}

// Run the app - Adding .then() since it's a Promise, and I don't want errors/warnings in my IDE ¯\_(ツ)_/¯
main().then();
