type LatLng = {
  latitude: number;
  longitude: number;
};

type FirestoreValue = {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  bytesValue?: string;
  stringValue?: string;
  referenceValue?: string;
  geoPointValue?: LatLng;
  arrayValue: { values: { [key: string]: unknown }[] };
  mapValue?: { fields: { [key: string]: FirestoreValue } };
};

export const serializeData = (data: { [key: string]: unknown }): { [key: string]: unknown } => {
  const serializedData: { [key: string]: unknown } = {};
  for (const key in data) {
    const value = data[key] as FirestoreValue;
    if (typeof value !== "object" || value === null) {
      return value;
    }
    switch (true) {
      case value.nullValue !== undefined:
        serializedData[key] = value.nullValue;
        break;
      case typeof value.booleanValue === "boolean":
        serializedData[key] = value.booleanValue;
        break;
      case value.integerValue !== undefined:
        serializedData[key] = value.integerValue;
        break;
      case typeof value.doubleValue === "number":
        serializedData[key] = value.doubleValue;
        break;
      case value.timestampValue !== undefined:
        serializedData[key] = value.timestampValue;
        break;
      case value.bytesValue !== undefined:
        serializedData[key] = value.bytesValue;
        break;
      case value.stringValue !== undefined:
        serializedData[key] = value.stringValue;
        break;
      case value.referenceValue !== undefined:
        serializedData[key] = value.referenceValue;
        break;
      case value.mapValue !== undefined:
        serializedData[key] = serializeData(value.mapValue.fields);
        break;
      case value.geoPointValue !== undefined:
        serializedData[key] = value.geoPointValue;
        break;
      case value.arrayValue !== undefined:
        serializedData[key] = value.arrayValue.values.map((value) => {
          if (value.mapValue !== undefined && value.mapValue !== null)
            return serializeData(value.mapValue.fields);
          return serializeData(value);
        });
        break;
      default:
        console.warn("Unexpected FirestoreValue type:", value);
        serializedData[key] = null;
    }
  }

  return serializedData;
};
