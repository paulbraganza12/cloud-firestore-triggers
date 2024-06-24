import { DocumentData, Timestamp } from "@google-cloud/firestore";
import { google } from "../../protos/compiledFirestore";

const RESERVED_MAP_KEY = "__type__";
const RESERVED_MAP_KEY_VECTOR_VALUE = "__vector__";
const VECTOR_MAP_VECTORS_KEY = "value";

// inspired by: https://github.com/googleapis/nodejs-firestore/blob/main/dev/src/serializer.ts

interface ProtobufJsValue extends google.events.cloud.firestore.v1.IValue {
  valueType?: string;
}

const detectValueType = (proto: ProtobufJsValue): string => {
  let valueType: string | undefined;

  if (proto.valueType) {
    valueType = proto.valueType;
  } else {
    const detectedValues: string[] = [];

    if (proto.stringValue !== undefined) {
      detectedValues.push("stringValue");
    }
    if (proto.booleanValue !== undefined) {
      detectedValues.push("booleanValue");
    }
    if (proto.integerValue !== undefined) {
      detectedValues.push("integerValue");
    }
    if (proto.doubleValue !== undefined) {
      detectedValues.push("doubleValue");
    }
    if (proto.timestampValue !== undefined) {
      detectedValues.push("timestampValue");
    }
    if (proto.referenceValue !== undefined) {
      detectedValues.push("referenceValue");
    }
    if (proto.arrayValue !== undefined) {
      detectedValues.push("arrayValue");
    }
    if (proto.nullValue !== undefined) {
      detectedValues.push("nullValue");
    }
    if (proto.mapValue !== undefined) {
      detectedValues.push("mapValue");
    }
    if (proto.geoPointValue !== undefined) {
      detectedValues.push("geoPointValue");
    }
    if (proto.bytesValue !== undefined) {
      detectedValues.push("bytesValue");
    }

    if (detectedValues.length !== 1) {
      throw new Error(`Unable to infer type value from '${JSON.stringify(proto)}'.`);
    }

    valueType = detectedValues[0];
  }

  // Special handling of mapValues used to represent other data types
  if (valueType === "mapValue") {
    const fields = proto.mapValue?.fields;
    if (fields) {
      const props = Object.keys(fields);
      if (
        props.indexOf(RESERVED_MAP_KEY) !== -1 &&
        detectValueType(fields[RESERVED_MAP_KEY]) === "stringValue" &&
        fields[RESERVED_MAP_KEY].stringValue === RESERVED_MAP_KEY_VECTOR_VALUE
      ) {
        valueType = "vectorValue";
      }
    }
  }

  return valueType;
};

const createTimestamp = (timestamp: google.protobuf.ITimestamp): Timestamp => {
  return new Timestamp(Number(timestamp.seconds || 0), timestamp.nanos || 0);
};

const decodeValue = (proto: google.events.cloud.firestore.v1.IValue): unknown => {
  const valueType = detectValueType(proto);

  switch (valueType) {
    case "stringValue": {
      return proto.stringValue;
    }
    case "booleanValue": {
      return proto.booleanValue;
    }
    case "integerValue": {
      return Number(proto.integerValue!);
    }
    case "doubleValue": {
      return proto.doubleValue;
    }
    case "timestampValue": {
      return createTimestamp(proto.timestampValue!).toDate();
    }
    case "referenceValue": {
      return proto.referenceValue;
      // const resourcePath = QualifiedResourcePath.fromSlashSeparatedString(
      //   proto.referenceValue!
      // );
      // return createReference(resourcePath.relativeName);
    }
    case "arrayValue": {
      const array: unknown[] = [];
      if (Array.isArray(proto.arrayValue!.values)) {
        for (const value of proto.arrayValue!.values!) {
          array.push(decodeValue(value));
        }
      }
      return array;
    }
    case "nullValue": {
      return null;
    }
    case "mapValue": {
      const fields = proto.mapValue!.fields;
      if (fields) {
        const obj: DocumentData = {};
        for (const prop of Object.keys(fields)) {
          obj[prop] = decodeValue(fields[prop]);
        }
        return obj;
      } else {
        return {};
      }
    }
    case "vectorValue": {
      const fields = proto.mapValue!.fields!;
      const vectorField = fields[VECTOR_MAP_VECTORS_KEY];
      return vectorField.arrayValue?.values?.map((v) => {
        return v.doubleValue!;
      });
    }
    case "geoPointValue": {
      return {
        latitude: proto.geoPointValue?.latitude,
        longitude: proto.geoPointValue?.longitude,
      };
    }
    case "bytesValue": {
      return proto.bytesValue;
    }
    default: {
      throw new Error("Cannot decode type from Firestore Value: " + JSON.stringify(proto));
    }
  }
};

export const serializeData = (data: {
  [key: string]: google.events.cloud.firestore.v1.IValue;
}): { [key: string]: unknown } => {
  const serializedData: { [key: string]: unknown } = {};
  for (const prop of Object.keys(data)) {
    serializedData[prop] = decodeValue(data[prop]);
  }

  return serializedData;
};
