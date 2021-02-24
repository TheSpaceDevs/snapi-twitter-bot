import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    OneToMany
} from "typeorm";
import {Tweet} from "./Tweet";

export interface INewsSite {
    name: string;
    newsSiteId: string;
    tweets?: Tweet[];
}

@Entity()
@Unique(["name", "newsSiteId"])
export class NewsSite implements INewsSite {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name: string;

    @Column()
    newsSiteId: string;

    @OneToMany(() => Tweet, tweet => tweet.newsSite)
    tweets!: Tweet[]; // Using the postfix (!) since TypeORM will fill this

    @CreateDateColumn()
    createdAt!: Date; // Using the postfix (!) since the decorator will set it

    @UpdateDateColumn()
    updatedAt!: Date; // Using the postfix (!) since the decorator will set it

    constructor(name: string, newsSiteId: string) {
        this.name = name;
        this.newsSiteId = newsSiteId;
    }
}