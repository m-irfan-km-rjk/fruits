import { renderHtml } from "./renderHtml";

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const method = request.method;

    // ---------------- CREATE ITEM ----------------
    if (method === "POST" && url.pathname === "/items") {
      const body = await request.json();
      const {id, name, price, quantity, image } = body;
      if(id==null){
        return Response.json({
          success: false,
          message: "ID is required",
        }, { status: 400 });
      }
      else if(name==null){
        return Response.json({
          success: false,
          message: "Name is required",
        }, { status: 400 });
      }
      else if(price==null){
        return Response.json({
          success: false,
          message: "Price is required",
        }, { status: 400
        })
      }
      else{
      const result = await env.DB.prepare(
        `INSERT INTO items (id, name, price, quantity, image)
         VALUES (?, ?, ?, ?,?)`
      ).bind(id,name, price, quantity, image).run();
      if(result.success ==true){
         return Response.json({
        success: true,
        item: { id:id, name:name, price:price, quantity:quantity, image:image },
      });
      }
      else{
        return Response.json({
          success:false,         
        });
      }
    }
    }

    // ---------------- GET ALL ITEMS ----------------
    if (method === "GET" && url.pathname === "/items") {
      const { results } = await env.DB.prepare(
        `SELECT * FROM items ORDER BY id DESC`
      ).all();

      return Response.json(results);
    }

    // ---------------- UPDATE ITEM ----------------
    if (method === "PUT" && url.pathname.startsWith("/items/")) {
      const id = url.pathname.split("/")[2];
      const body = await request.json();
      const { name, price, quantity, image } = body;

      await env.DB.prepare(
        `UPDATE items
         SET name = ?, price = ?, quantity = ?, image = ?
         WHERE id = ?`
      )
        .bind(name, price, quantity, image, id)
        .run();

      return Response.json({ success: true });
    }

    // ---------------- DELETE ITEM ----------------
    if (method === "DELETE" && url.pathname.startsWith("/items/")) {
      const id = url.pathname.split("/")[2];

      await env.DB.prepare(`DELETE FROM items WHERE id = ?`)
        .bind(id)
        .run();

      return Response.json({ success: true });
    }

    return new Response("Not Found", { status: 404 });
  },
};