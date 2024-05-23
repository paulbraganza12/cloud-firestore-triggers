### Description

In this project, we are publishing a `UsersDocumentWritten` message to the `user-written` topic. The message is triggered on the `onDocumentWritten` Firestore event

![alt text](https://github.com/paulbraganza12/cloud-firestore-triggers/assets/25667662/935b8ac7-73fc-4af6-b1f5-85d83854c6a8)

```
{
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
    }
}
```

Example:

```
{
  json: {
    correlationId: 'e22f6e99-9207-410a-8106-ff0ae825e8af',
    originator: "data-stream",
    payload: {
      updateType: 'update',
      value: {
				title: "new title",
			},
      subject: 'user/123/feed/1'
    }
  },
  attributes: {
    messageType: 'UserDocumentWritten',
    messageVersion: '1',
    collectionPath: 'user/123/feed'
  }
}
```

### Technologies

- Docker
- TypeScript
- Vitest
- Node
- [Google Cloud Event](https://cloud.google.com/functions/docs/calling/cloud-firestore#functions_cloudevent_firebase_firestore-nodejs)
- [PubSub](https://cloud.google.com/pubsub/docs/overview)
- [Firestore Triggers](https://cloud.google.com/functions/docs/calling/cloud-firestore) using Cloud Functions 2nd gen

## Getting Started

### Pre-Requisites

- [nvm](https://github.com/nvm-sh/nvm) (or another Node.js version manager)
- A `.env` file

### Create a `.env` file

Copy the `.env.example` from this directory and save it as `.env`.

### Installing

```bash
nvm use
npm install
```

### Run Docker from the root before testing

```bash
docker-compose up emulator
```

### Run Vitest

```bash
npm run test
```
