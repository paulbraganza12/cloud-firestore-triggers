import * as functions from "@google-cloud/functions-framework";
import * as userFirestoreTopic from "./pubsub/user-firestore";
import { PubSub } from "@google-cloud/pubsub";
import { parseEventData } from "./utils/parse-event-data";

const pubsub: PubSub = new PubSub({ projectId: process.env.GCLOUD_PROJECT });

export const userWrittenHandler = async (
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

functions.cloudEvent("userWritten", userWrittenHandler);
