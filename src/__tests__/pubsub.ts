/* eslint-disable @typescript-eslint/no-explicit-any */
import { PubSub, Subscription } from "@google-cloud/pubsub";
import { USER_STREAM } from "../config";
import { retry } from "ts-retry-promise";

const pubsub = new PubSub({ projectId: process.env.FIREBASE_PROJECT_ID });

let subscriptions: Subscription[] = [];

export const createRequiredTopics = async () => {
  await Promise.all([USER_STREAM].map(createTopic));
};

export const createTopic = async (topicName: string) => {
  const pubsub = new PubSub({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  const topic = pubsub.topic(topicName);
  const [exists] = await topic.exists();
  if (!exists) {
    await topic.create();
  }
};

export const tearDownPubSub = async (): Promise<void> => {
  const topics = await pubsub.getTopics();
  for (const subscription of subscriptions) {
    await subscription.delete();
  }
  subscriptions = [];
  for (const topic of topics[0]) {
    await topic.delete();
  }
};

export type CapturedMessage = {
  data: any;
  attributes: any;
};

export const setUpSubscription = async (
  topic: string,
): Promise<{
  messages: CapturedMessage[];
  subscription: Subscription;
}> => {
  const existingSubscriptions = subscriptions.filter((sub) => {
    return sub.name.includes(topic);
  });

  let subscription: Subscription;
  if (existingSubscriptions.length === 0) {
    [subscription] = await pubsub.topic(topic).createSubscription(topic);
    subscriptions.push(subscription);
  } else {
    subscription = existingSubscriptions[0];
  }

  const messages: CapturedMessage[] = [];
  subscription.on("message", (message) => {
    const attributes = message.attributes;
    const decodedMessage = JSON.parse(message.data as any);
    messages.push({
      data: decodedMessage,
      attributes,
    });
  });
  return { messages, subscription };
};

export const waitForMessage = async (messages: unknown[]) => {
  await retry(async () => {
    if (messages.length === 0) {
      return Promise.reject(new Error("No messages received"));
    } else {
      return Promise.resolve();
    }
  }).catch((e) => {
    throw e;
  });
};
