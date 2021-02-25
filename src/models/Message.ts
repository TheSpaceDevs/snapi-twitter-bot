import {
  IsDate,
  IsDefined,
  IsUrl,
  validate,
  ValidationError,
} from "class-validator";
import { ConsumeMessage } from "amqplib";

// Takes the raw amqp message and sets the fields we need later in the app.
// Exposes a validate() method to validate that all fields are correctly set.
export class Message {
  @IsDefined()
  title: string = "";

  @IsUrl()
  url: string = "";

  @IsDefined()
  newsSite: string = "";

  @IsDate()
  publishedAt: Date = new Date();

  validationErrors: ValidationError[] | undefined;

  constructor(message: ConsumeMessage | null) {
    if (message) {
      const msg = JSON.parse(message.content.toString());

      this.title = msg.title;
      this.url = msg.url;
      this.newsSite = msg.newsSite;
      this.publishedAt = new Date(msg.publishedAt);
    }
  }

  async validate(): Promise<boolean> {
    const validation = await validate(this);

    this.validationErrors = validation;

    return validation.length === 0;
  }
}
