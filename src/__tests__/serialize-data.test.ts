import { describe, expect, test } from "vitest";
import { serializeData } from "../utils/serialize-data";

describe("serializeData", () => {
  test("should return firestore json object representation of the event data", () => {
    const eventData = {
      categoryIds: {
        arrayValue: {
          values: [{ stringValue: "1" }, { stringValue: "2" }],
        },
      },
      geoLocation: {
        geoPointValue: {
          latitude: -90.0,
          longitude: -180.0,
        },
      },
      bytesData: {
        bytesValue: "SGVsbG8gV29ybGQ=",
      },
      intValue: {
        integerValue: "50",
      },
      isActive: { booleanValue: false },
      paused: { nullValue: null },
      nestedMap: {
        mapValue: {
          fields: {
            field1: {
              mapValue: {
                fields: {
                  value: { stringValue: "x" },
                  subfield: {
                    mapValue: {
                      fields: {
                        value1: { stringValue: "1" },
                        value2: { stringValue: "2" },
                        value3: {
                          arrayValue: {
                            values: [{ stringValue: "x" }, { stringValue: "1" }],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            field2: {
              arrayValue: {
                values: [
                  {
                    stringValue: "x",
                  },
                  {
                    integerValue: "1",
                  },
                ],
              },
            },
          },
        },
      },
    };
    const expectedData = {
      categoryIds: ["1", "2"],
      geoLocation: {
        latitude: -90.0,
        longitude: -180.0,
      },
      bytesData: "SGVsbG8gV29ybGQ=",
      intValue: "50",
      isActive: false,
      paused: null,
      nestedMap: {
        field1: {
          value: "x",
          subfield: {
            value1: "1",
            value2: "2",
            value3: ["x", "1"],
          },
        },
        field2: ["x", "1"],
      },
    };

    const serializedData = serializeData(eventData);

    expect(serializedData).toStrictEqual(expectedData);
  });
});
