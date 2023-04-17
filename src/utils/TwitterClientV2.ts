import {TweetV2PostTweetResult, TwitterApi} from 'twitter-api-v2';
import {Tweet} from "../entity/Tweet";

class TwitterClientV2 {
    private client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN ?? "").v2;

    async sendTweet(tweet: Tweet): Promise<TweetV2PostTweetResult | void> {
        const tweetText = `New ${tweet.type} from ${tweet.newsSite.name}: ${tweet.title} - ${tweet.url} #space #spaceflight #news`;

        if (process.env.DEBUG) {
            return console.log("DEBUG!", tweetText);
        } else {
            return this.client.tweet(tweetText);
        }
    }
}

export const twitterClientV2: TwitterClientV2 = new TwitterClientV2();
