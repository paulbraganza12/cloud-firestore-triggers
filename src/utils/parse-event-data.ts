import { CloudEvent } from "@google-cloud/functions-framework";
import { load, Reader } from "protobufjs";
import path from "path";
import { serializeData } from "./serialize-data";
import { EventType } from "../config";
import { google } from "../../protos/compiledFirestore";

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
  if (cloudEvent.data === undefined) {
    throw new Error("cloud event data is not defined");
  }

  // DocumentEventData
  const root = await load(dataProtoPath);
  const DocumentEventDataType = root.lookupType(
    "google.events.cloud.firestore.v1.DocumentEventData",
  );

  const firestoreReceived = DocumentEventDataType.decode(
    cloudEvent.data,
  ).toJSON() as google.events.cloud.firestore.v1.DocumentEventData;

  const eventType = getEventType(firestoreReceived);

  const value = (firestoreReceived.value ?? firestoreReceived.oldValue)!;

  const subject = value.name!;
  const collectionPath = createCollectionPath(subject);
  const data = serializeData(value.fields!);

  return {
    id: cloudEvent.id,
    data: data,
    subject: subject,
    collectionPath: collectionPath,
    type: eventType,
  };
};

const getEventType = (
  firestoreReceived: google.events.cloud.firestore.v1.DocumentEventData,
): EventType => {
  if (isNullOrUndefined(firestoreReceived.oldValue)) {
    return EventType.CREATE;
  }
  if (isNullOrUndefined(firestoreReceived.value)) {
    return EventType.DELETE;
  }
  return EventType.UPDATE;
};

const isNullOrUndefined = (
  obj: google.events.cloud.firestore.v1.IDocument | null | undefined,
): boolean => {
  return obj === null || obj === undefined;
};

const createCollectionPath = (path: string): string => {
  const collectionHierarchy = path
    .split("/")
    .filter((_, index) => index % 2 == 0)
    .join(":");

  return collectionHierarchy;
};
