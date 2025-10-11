//server/src/utils/apiCredentials.ts
export const getApiCredentials = (affId) => {
  const creds = {
    639: {
      apiId: "F4A3F6C7CD7149FE8BB49F07273EAC92",
      apiPassword: "61450bc349",
    },
    640: {
      apiId: "348A67A17683429E8956E0E485E32B95",
      apiPassword: "b99845de6",
    },
    641: {
      apiId: "06398F7E1F6643D5A83FC81CCB170002",
      apiPassword: "22a5d6c0e",
    },
    642: { apiId: "4BB3951ED28343AAA618BC9F3978848C", apiPassword: "f8df238f" },
    643: {
      apiId: "A416804893EE4908A247E68E4AA8C0D0",
      apiPassword: "9611effc28",
    },
    644: { apiId: "DA606C06B98D4343BCB9CB7CAF1283D2", apiPassword: "3f8521d3" },
    648: { apiId: "264E13F561C349C28FAFA78471255831", apiPassword: "975a6c3" },
    660: { apiId: "4CEFEDFFF1164EC88DC46906E28B15A1", apiPassword: "3cbe24b" },
    651: { apiId: "DF2357BA84834ECCAA3431DE14A63398", apiPassword: "c411d15" },
    666: { apiId: "AF2579E4201E4A7189D1177E107347EA", apiPassword: "a2e0b61" },
    672: {
      apiId: "D1976A979D6B464C85C96161EDF19D62",
      apiPassword: "11e9ef972",
    },
    673: { apiId: "A31EDE365AA741D1B55D9777F38529F5", apiPassword: "4b6a529" },
    default: {
      apiId: "5C3124FB2F884598BE1B45A9E8DCBE2A",
      apiPassword: "6379aec09",
    },
  };
  return creds[affId] || creds.default;
};
