const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
}; 
export async function getItemsFromDB(env) {
    const { results } = await env.DB.prepare(
      `SELECT id, name, price, quantity, image FROM items ORDER BY id DESC`
    ).all();
    return results;
}   
export async function getNewItems(env) {
    const { results } = await env.DB.prepare(
      `SELECT id, name, price, quantity, image FROM items ORDER BY id DESC WHERE onupdate > datetime('now', '-10 minutes')`
    ).bind().all();
    return results;
}
export async function getItemsmrtFromDB(env) {
    const { results } = await env.DB.prepare(
      `SELECT id, name, price, quantity, image, onupdate FROM mrtitems ORDER BY id DESC`
    ).all();
    return results;
}   
export async function getNewItemsmrt(env) {
    const { results } = await env.DB.prepare(
      `SELECT id, name, price, quantity, image, onupdate FROM mrtitems ORDER BY id DESC WHERE onupdate > datetime('now', '-10 minutes')`
    ).bind().all();
    return results;
}
export async function itemwebsocket(request, env) {
try{ 
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());

    server.accept();

    // Send initial data
    server.send(JSON.stringify({
      type: "init",
      items: await getItemsFromDB(env),
    }));

    // Example: push new data every 10 minutes
    setInterval(async () => {
      const newItems = await getNewItems(env);
      server.send(JSON.stringify({
        type: "update",
        items: newItems
      }));
    }, 600000);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
 catch (err){
  return new Response(JSON.stringify({
    success: false,
    error: err.message
  }), { status: 500, headers });
}
}   

export async function itemmrtwebsocket(request, env) {
try{ 
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());

    server.accept();

    // Send initial data
    server.send(JSON.stringify({
      type: "init",
      items: await getItemsmrtFromDB(env),
    }));

    // Example: push new data every 10 minutes
    setInterval(async () => {
      const newItems = await getNewItemsmrt(env);
      server.send(JSON.stringify({
        type: "update",
        items: newItems
      }));
    }, 600000);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
 catch (err){
  return new Response(JSON.stringify({
    success: false,
    error: err.message
  }), { status: 500, headers });
}
}   
