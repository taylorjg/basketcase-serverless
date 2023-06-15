import * as U from "./utils";

export async function handler(event) {
  return U.wrapHandlerImplementation("/api/search", async () => {
    const body = JSON.parse(Buffer.from(event.body, "base64").toString());
    return { body };
  });
};
