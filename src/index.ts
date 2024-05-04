import * as functions from "@google-cloud/functions-framework";
import * as userFirestoreTopic from "./pubsub/user-firestore";
import { PubSub } from "@google-cloud/pubsub";

const pubsub: PubSub = new PubSub({ projectId: process.env.FIREBASE_PROJECT_ID });

export const userWritten = async (cloudEvent: functions.CloudEvent<unknown>) => {
  await userFirestoreTopic.publishUserWritten(pubsub, cloudEvent);
};

functions.cloudEvent("userWritten", userWritten);
