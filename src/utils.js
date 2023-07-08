import axios from "axios";
import packageJson from "../package.json";

export const makeResponse = (statusCode, body) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

export const makeErrorResponse = (statusCode, errorMessage, endpointName) => {
  const enhancedErrorMessage = `[${endpointName}] ${errorMessage}`;
  return makeResponse(statusCode, { error: enhancedErrorMessage });
};

const extractErrorMessage = (e) => {
  console.error("[extractErrorMessage]", e.toString());
  if (axios.isAxiosError(e) && e.response?.data) {
    if (e.response.data.toString) {
      console.error("[extractErrorMessage]", e.response.data.toString());
    } else {
      console.error("[extractErrorMessage]", e.response.data);
    }
  }
  return e.message;
};

export const wrapHandlerImplementation = async (
  endpointName,
  handlerImplementation
) => {
  try {
    console.info(
      "endpointName:",
      endpointName,
      "version:",
      packageJson.version
    );

    let specialResponse = undefined;
    const makeSpecialResponse = (statusCode, error) => {
      console.error("[makeSpecialResponse]", error);
      specialResponse = makeErrorResponse(statusCode, error, endpointName);
    };

    const result = await handlerImplementation(makeSpecialResponse);
    return specialResponse ?? makeResponse(200, result);
  } catch (error) {
    return makeErrorResponse(500, extractErrorMessage(error), endpointName);
  }
};
