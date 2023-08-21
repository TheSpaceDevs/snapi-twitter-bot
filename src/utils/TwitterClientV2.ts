import {TweetV2PostTweetResult, TwitterApi, TwitterApiReadWrite} from 'twitter-api-v2';
import {Tweet} from "../entity/Tweet";

class TwitterClientV2 {
    private client: TwitterApiReadWrite

    constructor(bearerToken?: string) {
        // Proccess.env.BEARER_TOKEN can be empty, so we need to check for that.
        if (!bearerToken) {
            throw new Error("No bearer token provided");
        }

        this.client = new TwitterApi(bearerToken).readWrite;
    }

    async sendTweet(tweet: Tweet): Promise<TweetV2PostTweetResult | void> {
        const tweetText = `New ${tweet.type} from ${tweet.newsSite.name}: ${tweet.title} - ${tweet.url} #space #spaceflight #news`;

        if (process.env.DEBUG) {
            return console.log("DEBUG!", tweetText);
        } else {
            return this.client.v2.tweet(tweetText)
        }
    }
}

export const twitterClientV2: TwitterClientV2 = new TwitterClientV2(process.env.BEARER_TOKEN);
