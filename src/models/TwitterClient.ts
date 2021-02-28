import Twitter from "twitter";
import { ArticleTypes } from "../handlers/handleMessage";

class TwitterClient {
  private client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY ?? "",
    consumer_secret: process.env.CONSUMER_SECRET ?? "",
    access_token_key: process.env.ACCESS_TOKEN_KEY ?? "",
    access_token_secret: process.env.ACCESS_TOKEN_SECRET ?? "",
  });

  sendTweet(
    type: ArticleTypes,
    title: string,
    newsSite: string,
    url: string
  ): void {
    const tweetText = `New ${type} from ${newsSite}: ${title} - ${url} #space #spaceflight #news`;
    try {
      // return this.client.post('statuses/update', {status: tweetText})
    } catch (e) {
      console.error(e);
    }
    console.log(tweetText);
  }
}

export const twitterClient = new TwitterClient();
