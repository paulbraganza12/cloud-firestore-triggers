import * as functions from "@google-cloud/functions-framework";
import * as userFirestoreTopic from "./pubsub/user-firestore";
import { PubSub } from "@google-cloud/pubsub";
import { parseEventData } from "./utils/parse-event-data";

const pubsub: PubSub = new PubSub({ projectId: process.env.FIREBASE_PROJECT_ID });

export const userWritten = async (
  cloudEvent: functions.CloudEvent<protobuf.Reader | Uint8Array>,
) => {
  try {
    const parsedEvent = await parseEventData(cloudEvent);
    await userFirestoreTopic.publishUserWritten(pubsub, parsedEvent);
    return;
  } catch (error) {
    console.error(error);
  }
};

functions.cloudEvent("userWritten", userWritten);
