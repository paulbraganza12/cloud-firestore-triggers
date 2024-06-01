import { describe, test, expect } from "vitest";
import { parseEventData } from "../utils/parse-event-data";
import path from "path";
import * as protobuf from "protobufjs";
import { CloudEvent } from "cloudevents";
import { EventType } from "../config";

const dataProtoPath = path.join(__dirname, "../data.proto");

describe("parseEventData", async () => {
  const root = await protobuf.load(dataProtoPath);
  test("throws an error for undefined cloud event data", async () => {
    const cloudEvent = new CloudEvent({
      source: "firebase",
      type: "google.cloud.firestore.document.v1.updated",
    });

    await expect(parseEventData(cloudEvent)).rejects.toThrowError(
      "cloud event data is not defined",
    );
  });

  test("parse cloud event when a document is created", async () => {
    const DocumentEventData = root.lookupType("google.events.cloud.firestore.v1.DocumentEventData");
    const Document = root.lookupType("google.events.cloud.firestore.v1.Document");
    const data = DocumentEventData.create({
      oldValue: null,
      value: Document.create({
        name: "users/123/feeds/1",
        fields: {
          title: { stringValue: "test" },
        },
      }),
    });
    const cloudEvent = new CloudEvent({
      source: "firebase",
      type: "google.cloud.firestore.document.v1.written",
      data: DocumentEventData.encode(data).finish(),
    });
    const expectedParsedData = {
      id: cloudEvent.id,
      data: {
        title: "test",
      },
      subject: "users/123/feeds/1",
      collectionPath: "users:feeds",
      type: EventType.CREATE,
    };

    const parsedData = await parseEventData(cloudEvent);

    expect(parsedData).toStrictEqual(expectedParsedData);
  });

  test("parse cloud event when a document is deleted", async () => {
    const DocumentEventData = root.lookupType("google.events.cloud.firestore.v1.DocumentEventData");
    const Document = root.lookupType("google.events.cloud.firestore.v1.Document");
    const data = DocumentEventData.create({
      oldValue: Document.create({
        name: "users/123/feeds/1",
        fields: {
          title: { stringValue: "test" },
        },
      }),
      value: null,
    });
    const cloudEvent = new CloudEvent({
      source: "firebase",
      type: "google.cloud.firestore.document.v1.written",
      data: DocumentEventData.encode(data).finish(),
    });
    const expectedParsedData = {
      id: cloudEvent.id,
      data: {
        title: "test",
      },
      subject: "users/123/feeds/1",
      collectionPath: "users:feeds",
      type: EventType.DELETE,
    };

    const parsedData = await parseEventData(cloudEvent);

    expect(parsedData).toStrictEqual(expectedParsedData);
  });

  test("parse cloud event when a document is updated", async () => {
    const DocumentEventData = root.lookupType("google.events.cloud.firestore.v1.DocumentEventData");
    const Document = root.lookupType("google.events.cloud.firestore.v1.Document");
    const data = DocumentEventData.create({
      oldValue: Document.create({
        name: "users/123/feeds/1",
        fields: {
          title: { stringValue: "test" },
        },
      }),
      value: Document.create({
        name: "users/123/feeds/1",
        fields: {
          title: { stringValue: "test-new" },
        },
      }),
    });
    const cloudEvent = new CloudEvent({
      source: "firebase",
      type: "google.cloud.firestore.document.v1.written",
      data: DocumentEventData.encode(data).finish(),
    });
    const expectedParsedData = {
      id: cloudEvent.id,
      data: {
        title: "test-new",
      },
      subject: "users/123/feeds/1",
      collectionPath: "users:feeds",
      type: EventType.UPDATE,
    };

    const parsedData = await parseEventData(cloudEvent);

    expect(parsedData).toStrictEqual(expectedParsedData);
  });
});
