import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { NewsSite } from "./NewsSite";
import { Types } from "../models/Enums";

export interface ITweet {
  title: string;
  newsSite: NewsSite;
  url: string;
}

@Entity()
export class Tweet implements ITweet {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  title: string;

  // Can't use the Enum type with sqlite :(
  @Column()
  type: Types;

  @ManyToOne(() => NewsSite, (newsSite) => newsSite.tweets, { eager: true })
  newsSite: NewsSite;

  @Column()
  url: string;

  @CreateDateColumn()
  createdAt!: Date; // Using the postfix (!) since the decorator will set it

  @UpdateDateColumn()
  updatedAt!: Date; // Using the postfix (!) since the decorator will set it

  constructor(title: string, type: Types, newsSite: NewsSite, url: string) {
    this.title = title;
    this.type = type;
    this.newsSite = newsSite;
    this.url = url;
  }
}
