import Twitter from 'twitter';

class TwitterClient {
    private client = new Twitter({
        consumer_key: process.env.CONSUMER_KEY ?? '',
        consumer_secret: process.env.CONSUMER_SECRET ?? '',
        access_token_key: process.env.ACCESS_TOKEN_KEY ?? '',
        access_token_secret: process.env.ACCESS_TOKEN_SECRET ?? ''
    })

    sendTweet(type: string, title: string, newsSite: string, url: string): void {
        const tweetText = `New ${type} from ${newsSite}: ${title} - ${url} #space #spaceflight #news`;
        // return this.client.post('statuses/update', {status: tweetText})
        console.log(tweetText)
    }
}

export const twitterClient = new TwitterClient();