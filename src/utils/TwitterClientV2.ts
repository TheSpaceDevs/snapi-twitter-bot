import {TweetV2PostTweetResult, TwitterApi, TwitterApiReadWrite} from 'twitter-api-v2';
import {Tweet} from "../entity/Tweet";

class TwitterClientV2 {
    private client: TwitterApiReadWrite

    constructor(apiKey: string, apiSecret: string, accessToken: string, accessTokenSecret: string) {
        this.client = new TwitterApi({
            appKey: apiKey,
            appSecret: apiSecret,
            accessToken: accessToken,
            accessSecret: accessTokenSecret,
        }).readWrite;
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

export const twitterClientV2: TwitterClientV2 = new TwitterClientV2(process.env.API_KEY!, process.env.API_SECRET!, process.env.ACCESS_TOKEN!, process.env.ACCESS_TOKEN_SECRET!);
