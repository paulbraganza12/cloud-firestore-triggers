import { PubSub } from "@google-cloud/pubsub";
import { USER_STREAM } from "../config";
import { ParsedEvent } from "../utils/parse-event-data";

export const publishUserWritten = async (pubsub: PubSub, event: ParsedEvent): Promise<void> => {
  const topic = pubsub.topic(USER_STREAM);
  const message = {
    json: {
      correlationId: event.id,
      originator: "data-stream",
      payload: {
        updateType: event.type,
        value: event.data,
        subject: event.subject,
      },
    },
    attributes: {
      messageType: "UserDocumentWritten",
      messageVersion: "1",
      collectionPath: event.collectionPath,
    },
  };
  await topic.publishMessage(message);
};
