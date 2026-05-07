import { getitems, postitems, putitem, deleteitem } from "./items";
import { getmrtitems, postmrtitems, putmrtitem, deletemrtitem } from "./mrtitems";
import { itemwebsocket } from "./webscoket";
import { login, createUser } from "./auth";

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const method = request.method;

    if (method == "POST" && url.pathname == "/login") { return await login(request, env); }
    if (method == "POST" && url.pathname == "/create-user") { return await createUser(request, env); }

    if (method === "POST" && url.pathname === "/items") { return await postitems(request, env); }
    if (method === "GET" && url.pathname === "/items") { return await getitems(request, env); }
    if (method === "PUT" && url.pathname.startsWith("/items/")) { return await putitem(request, env); }
    if (method === "DELETE" && url.pathname.startsWith("/items/")) { return await deleteitem(request, env); }
    if (method === "GET" && url.pathname === "/mrtitems") { return await getmrtitems(request, env); }
    if (method === "POST" && url.pathname === "/mrtitems") { return await postmrtitems(request, env); }
    if (method === "PUT" && url.pathname.startsWith("/mrtitems/")) { return await putmrtitem(request, env); }
    if (method === "DELETE" && url.pathname.startsWith("/mrtitems/")) { return await deletemrtitem(request, env); }

    if (method === "GET" && url.pathname === "/items/ws") { return await itemwebsocket(request, env); }
    return new Response("Not Found", { status: 404 });
  }
}