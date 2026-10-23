import handler from "../api/contact.js";

function responseMock() {
  return {
    statusCode: 200,
    payload: undefined,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

const getResponse = responseMock();
await handler({ method: "GET", body: {} }, getResponse);
if (getResponse.statusCode !== 405) throw new Error("GET must return 405");

const invalidResponse = responseMock();
await handler({ method: "POST", body: { name: "Test" } }, invalidResponse);
if (invalidResponse.statusCode !== 422) throw new Error("Incomplete submissions must return 422");

const unconfiguredResponse = responseMock();
await handler(
  {
    method: "POST",
    body: {
      name: "Test User",
      phone: "+91 99999 99999",
      email: "test@example.com",
      message: "A valid test enquiry that must not be sent.",
    },
  },
  unconfiguredResponse,
);
if (unconfiguredResponse.statusCode !== 503) {
  throw new Error("A valid submission without SMTP configuration must fail safely with 503");
}

console.log("Contact endpoint validation and safe-failure checks passed.");
