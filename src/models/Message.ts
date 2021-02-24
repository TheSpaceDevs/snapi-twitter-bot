import { IsDate, IsDefined, IsUrl } from "class-validator";

export class Message {
  @IsDefined()
  title: string;

  @IsUrl()
  url: string;

  @IsDefined()
  newsSite: string;

  @IsDate()
  publishedAt: Date;

  constructor(rawMessage: any) {
    this.title = rawMessage.title;
    this.url = rawMessage.url;
    this.newsSite = rawMessage.newsSite;
    this.publishedAt = new Date(rawMessage.publishedAt);
  }
}
