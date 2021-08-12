import {
  IsDate,
  IsDefined,
  IsUrl,
  IsEnum,
  validate,
  ValidationError,
} from "class-validator";
import { ConsumeMessage } from "amqplib";

import { Types } from "../utils/Enums";

interface IJsonMessage {
  type: Types;
  data: {
    title: string;
    url: string;
    newsSite: number;
    publishedAt: string;
  };
}

// Takes the raw amqp message and sets the fields we need later in the app.
// Exposes a validate() method to validate that all fields are correctly set.
export class Message {
  @IsDefined()
  @IsEnum(Types)
  type: Types = Types.article;

  @IsDefined()
  title: string = "";

  @IsUrl()
  url: string = "";

  @IsDefined()
  newsSite: number = 0;

  @IsDate()
  publishedAt: Date = new Date();

  validationErrors: ValidationError[] | undefined;

  constructor(message: ConsumeMessage | null) {
    if (message) {
      const msg: IJsonMessage = JSON.parse(message.content.toString());

      this.type = Types[msg.type];
      this.title = msg.data.title;
      this.url = msg.data.url;
      this.newsSite = msg.data.newsSite;
      this.publishedAt = new Date(msg.data.publishedAt);
    }
  }

  async validate(): Promise<boolean> {
    const validation = await validate(this);

    this.validationErrors = validation;

    return validation.length === 0;
  }
}
