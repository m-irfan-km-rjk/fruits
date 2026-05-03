const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
}; 
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

    // Example: push new data every 5 sec
    setInterval(async () => {
      const newItems = await getNewItems(env);
      server.send(JSON.stringify({
        type: "update",
        items: newItems
      }));
    }, 5000);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}catch(err){
  return new Response(JSON.stringify({
    success: false,
    error: err.message
  }), { status: 500, headers });
}

function getItemsFromDB(env) {
    const { results } = await env.DB.prepare(
      `SELECT * FROM items ORDER BY id DESC`
    ).all();
    return results;
}   
function getNewItems(env) {
    const { results } = await env.DB.prepare(
      `SELECT * FROM items`
    ).bind().all();
    return results;
}