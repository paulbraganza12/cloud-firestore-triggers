import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { CloudEvent } from "cloudevents";
import * as dataStream from "../index";
import * as protobuf from "protobufjs";
import { CapturedMessage, createRequiredTopics, setUpSubscription, waitForMessage } from "./pubsub";
import { Subscription } from "@google-cloud/pubsub";
import { USER_STREAM } from "../config";
import path from "path";

const dataProtoPath = path.join(__dirname, "../data.proto");

beforeAll(async () => {
  await createRequiredTopics();
});

describe("dataWritten", async () => {
  const root = await protobuf.load(dataProtoPath);
  let userFirestoreSubscription: {
    messages: CapturedMessage[];
    subscription: Subscription;
  };

  beforeEach(async () => {
    userFirestoreSubscription = await setUpSubscription(USER_STREAM);
  });

  afterEach(async () => {
    await userFirestoreSubscription?.subscription.close();
  });

  test("send user-stream message when a user document is written", async () => {
    const DocumentEventData = root.lookupType("google.events.cloud.firestore.v1.DocumentEventData");
    const Document = root.lookupType("google.events.cloud.firestore.v1.Document");
    const data = DocumentEventData.create({
      oldValue: Document.create({
        name: "users/123/feeds/1",
        fields: {
          title: { stringValue: "Feed Old" },
          description: { stringValue: "some old data" },
        },
      }),
      value: Document.create({
        name: "users/123/feeds/1",
        fields: {
          title: { stringValue: "Feed new" },
          description: { stringValue: "some new data" },
        },
      }),
    });
    const cloudEvent = new CloudEvent({
      source: "firebase",
      type: "google.cloud.firestore.document.v1.written",
      data: DocumentEventData.encode(data).finish(),
    });
    const expectedFirestoreData = {
      title: "Feed new",
      description: "some new data",
    };

    await dataStream.userWritten(cloudEvent);

    await waitForMessage(userFirestoreSubscription.messages);
    expect(userFirestoreSubscription.messages).toHaveLength(1);
    const message = userFirestoreSubscription.messages[0];
    expect(message.data.originator).toBe("data-stream");
    expect(message.data.correlationId).toBe(cloudEvent.id);
    expect(message.data.payload.updateType).toBe("update");
    expect(message.data.payload.value).toStrictEqual(expectedFirestoreData);
    expect(message.data.payload.subject).toBe("users/123/feeds/1");
    expect(message.data.originator).toBe("data-stream");
    expect(message.attributes.messageType).toBe("UserDocumentWritten");
    expect(message.attributes.messageVersion).toBe("1");
    expect(message.attributes.collectionPath).toBe("users:feeds");
  });
});
