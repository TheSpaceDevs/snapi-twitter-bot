import { DataSource } from "typeorm";
import { NewsSite } from "./entity/NewsSite";


export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_LOCATION
    ? `${process.env.DB_LOCATION}/snapi-twitter-bot.db`
    : "./snapi-twitter-bot.db",
  entities: [NewsSite]
})
