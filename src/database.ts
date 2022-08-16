import { DataSource } from "typeorm";
import { NewsSite } from "./entity/NewsSite";
import { Tweet } from "./entity/Tweet";


export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_LOCATION
    ? `${process.env.DB_LOCATION}/snapi-twitter-bot.db`
    : "./snapi-twitter-bot.db",
  entities: [NewsSite, Tweet],
  synchronize: true
})
