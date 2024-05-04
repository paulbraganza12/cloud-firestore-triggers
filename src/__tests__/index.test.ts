import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { CloudEvent } from "cloudevents";
import * as dataStream from "../index";
import * as admin from "firebase-admin";
import { CapturedMessage, createRequiredTopics, setUpSubscription, waitForMessage } from "./pubsub";
import { Subscription } from "@google-cloud/pubsub";
import { USER_STREAM } from "../config";

admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

beforeAll(async () => {
  await createRequiredTopics();
});

describe("dataWritten", () => {
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
    dataStream.userWritten(
      new CloudEvent({
        type: "google.cloud.firestore.document.v1.written",
        source: "https://github.com/GoogleCloudPlatform/functions-framework-nodejs",
      }),
    );
    await waitForMessage(userFirestoreSubscription.messages);
    expect(userFirestoreSubscription.messages).toHaveLength(1);
  });
});
