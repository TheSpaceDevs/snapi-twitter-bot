import amqp from "amqp-connection-manager";
import { ConfirmChannel } from "amqplib";
import "reflect-metadata";
import { captureException, init } from "@sentry/node";

import { handleMessage } from "./handlers/handleMessage";
import { NewsSite } from "./entity/NewsSite";
import newsSitesJson from "./news_sites.json";
import { AppDataSource } from "./database";

// Initialize Sentry
init({
  dsn: process.env.SENTRY_DSN,
});

// Create a main function, so we can use async/await
async function main() {
  try {
    // Set up the database
    await AppDataSource.initialize()


    // Import all sites from newsSites.json. This was dumped from the Spaceflight News API database
    for (const entry of newsSitesJson) {
      const site = await AppDataSource.manager.findOneBy(NewsSite, {
        newsSiteId: entry.id,
      });
      if (!site) {
        console.log("adding:", entry.name);
        let newsSite = new NewsSite(entry.name, entry.id);
        await AppDataSource.manager.save(newsSite);
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
    captureException(e);
    console.error(e);
  }
}

// Run the app - Adding .then() since it's a Promise, and I don't want errors/warnings in my IDE ¯\_(ツ)_/¯
main().then();
