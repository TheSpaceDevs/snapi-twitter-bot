import Twitter, { ResponseData } from "twitter";
import { Tweet } from "../entity/Tweet";

class TwitterClient {
  private client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY ?? "",
    consumer_secret: process.env.CONSUMER_SECRET ?? "",
    access_token_key: process.env.ACCESS_TOKEN_KEY ?? "",
    access_token_secret: process.env.ACCESS_TOKEN_SECRET ?? "",
  });

  sendTweet(tweet: Tweet): Promise<ResponseData> | void {
    const tweetText = `New ${tweet.type} from ${tweet.newsSite.name}: ${tweet.title} - ${tweet.url} #space #spaceflight #news`;

    if (process.env.DEBUG) {
      return console.log("DEBUG!", tweetText);
    } else {
      return this.client.post("statuses/update", { status: tweetText });
    }
  }
}

export const twitterClient = new TwitterClient();
