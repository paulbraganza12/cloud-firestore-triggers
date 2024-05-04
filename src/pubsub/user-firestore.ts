import { PubSub } from "@google-cloud/pubsub";
import { USER_STREAM } from "../config";
import { CloudEvent } from "@google-cloud/functions-framework";

export const publishUserWritten = async (
  pubsub: PubSub,
  event: CloudEvent<unknown>,
): Promise<void> => {
  const topic = pubsub.topic(USER_STREAM);
  const updateType = getEventType(event.type);
  const message = {
    json: {
      correlationId: event.id,
      originator: "data-stream",
      payload: {
        updateType,
      },
    },
    attributes: {
      messageType: "UserDocumentWritten",
      messageVersion: "1",
    },
  };
  await topic.publishMessage(message);
};

const getEventType = (eventType: string) => {
  switch (eventType) {
    case "google.cloud.firestore.document.v1.created":
      return "create";
    case "google.cloud.firestore.document.v1.updated":
      return "update";
    case "google.cloud.firestore.document.v1.deleted":
      return "delete";
    case "google.cloud.firestore.document.v1.written":
      return "written";
    default:
      return "update";
  }
};
