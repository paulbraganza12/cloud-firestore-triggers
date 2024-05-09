### Description

In this project, we are publishing `user-written` topic with the following message when on `onDocumentWritten` event is triggered

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

### Setup

1. Set up env vars for local environment:

```
cp .env.example .env
```

2. Install NodeJS18

```
nvm use
```

### Install App

```
npm i
```

### Run Docker from the root before testing

```
docker-compose up emulator
```

### Run Vitest

```
npm run test
```
