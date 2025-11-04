const { Centrifuge } = require("centrifuge");
const WebSocket = require("ws");

let client = null;
let subscriptions = [];

const eventHandlers = {
  onUpdate: null,
  onError: null,
  onConnect: null,
  onDisconnect: null,
};

function connect() {
  const wsUrl = `ws://updates.sparkscan.io/`;

  client = new Centrifuge(wsUrl, {
    websocket: WebSocket,
  });

  client.on("connected", () => {
    if (eventHandlers.onConnect) eventHandlers.onConnect();

    const channels = ["/token/network/MAINNET"];

    subscriptions = channels.map((channel) => {
      const sub = client.newSubscription(channel);

      sub.on("publication", (ctx) => {
        if (ctx) {
          eventHandlers.onUpdate(JSON.parse(ctx.data), ctx.channel);
        }
      });

      sub.subscribe();
      return sub;
    });
  });

  client.on("disconnected", (ctx) => {
    if (eventHandlers.onDisconnect) {
      eventHandlers.onDisconnect(ctx.code, ctx.reason || "");
    }
  });

  client.on("error", (ctx) => {
    if (eventHandlers.onError) {
      const error = new Error(ctx.message || ctx.error || "Unknown error");
      if (ctx.status) error.status = ctx.status;
      if (ctx.title) error.title = ctx.title;
      if (ctx.type) error.type = ctx.type;
      if (ctx.detail) error.detail = ctx.detail;
      eventHandlers.onError(error);
    }
  });

  client.connect();
}

function startTokenStream(handlers = {}) {
  if (handlers.onUpdate) eventHandlers.onUpdate = handlers.onUpdate;
  if (handlers.onError) eventHandlers.onError = handlers.onError;
  if (handlers.onConnect) eventHandlers.onConnect = handlers.onConnect;
  if (handlers.onDisconnect) eventHandlers.onDisconnect = handlers.onDisconnect;
  connect();
}

function stopTokenStream() {
  subscriptions.forEach((sub) => {
    sub.unsubscribe();
  });
  subscriptions = [];
  if (client) {
    client.disconnect();
    client = null;
  }
}

function isConnected() {
  return client && client.state === "connected";
}

module.exports = {
  startTokenStream,
  stopTokenStream,
  isConnected,
};
