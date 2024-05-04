import { CloudEvent } from "@google-cloud/functions-framework";
import { load, Reader } from "protobufjs";
import path from "path";

export type ParsedEvent = {
  id: string;
  data: Record<string, unknown>;
  subject: string;
  collectionPath: string;
  type: string;
};

const dataProtoPath = path.join(__dirname, "../data.proto");

export const parseEventData = async (
  cloudEvent: CloudEvent<Reader | Uint8Array>,
): Promise<ParsedEvent> => {
  const root = await load(dataProtoPath);
  const DocumentEventData = root.lookupType("google.events.cloud.firestore.v1.DocumentEventData");
  if (cloudEvent.data === undefined) {
    throw new Error("cloud event data is not defined");
  }
  const firestoreReceived = DocumentEventData.decode(cloudEvent.data).toJSON();

  const collectionPath = firestoreReceived.value.name.split("/").slice(0, -1).join("/");
  const eventType = getEventType(cloudEvent.type);

  return {
    id: cloudEvent.id,
    data: eventType === "delete" ? firestoreReceived.oldValue : firestoreReceived.value,
    subject: firestoreReceived.value.name,
    collectionPath: collectionPath,
    type: eventType,
  };
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
      throw new Error(`Unknown event type: ${eventType}`);
  }
};
