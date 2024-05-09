import { CloudEvent } from "@google-cloud/functions-framework";
import { load, Reader } from "protobufjs";
import path from "path";
import { serializeData } from "./serialize-data";
import { EventType } from "../config";

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

  const eventType = getEventType(firestoreReceived);

  const value = eventType === "delete" ? firestoreReceived.oldValue : firestoreReceived.value;
  const collectionPath = createCollectionPath(value.name);
  const subject = value.name;
  const data = serializeData(value.fields);

  return {
    id: cloudEvent.id,
    data: data,
    subject: subject,
    collectionPath: collectionPath,
    type: eventType,
  };
};

const getEventType = (firestoreReceived: Record<string, object>): EventType => {
  const isCreate = isEmptyObject(firestoreReceived.oldValue);
  const isDelete = isEmptyObject(firestoreReceived.value);

  if (isCreate) return EventType.CREATE;
  if (isDelete) return EventType.DELETE;
  return EventType.UPDATE;
};

const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length == 0;
};

const createCollectionPath = (path: string): string => {
  const collectionHierarchy = path
    .split("/")
    .filter((_, index) => index % 2 == 0)
    .join(":");

  return collectionHierarchy;
};
