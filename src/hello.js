import * as U from "./utils";

export async function handler(/* event, context, callback */) {
  return U.wrapHandlerImplementation("hello", async () => {
    const message = "Hello";
    return { message };
  });
};
