export async function postitems(request: Request, env: any) {
    const body = await request.json();
      const {id, name, price, quantity, image } = body;
      if(id==null){
        return Response.json({
    headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},          success: false,
          message: "ID is required",
        }, { status: 400 });
      }
      else if(name==null){
        return Response.json({
    headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},          success: false,
          message: "Name is required",
        }, { status: 400 });
      }
      else if(price==null){
        return Response.json({
    headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},          success: false,
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
        const item = await env.DB.prepare(
          `SELECT id, name, price, quantity, image FROM items WHERE id = ?`
        ).bind(id).run();
        console.log(item);
        return Response.json({
    headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},          success: true,
          item: item.results[0],
        });
      }
      else{
        return Response.json({
    headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},          success:false,         
        });
      }
  }
}
export async function putitem(request: Request, env: any) {
  const id = new URL(request.url).pathname.split("/")[2];
      const body = await request.json();
      const { name, price, quantity, image } = body;

      await env.DB.prepare(
        `UPDATE items
         SET name = ?, price = ?, quantity = ?, image = ?
         WHERE id = ?`
      )
        .bind(name, price, quantity, image, id)
        .run();

      return Response.json({
  headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},        success: true
      });
}
export async function deleteitem(request: Request, env: any) {
  const id = new URL(request.url).pathname.split("/")[2];
  const result = await env.DB.prepare(`DELETE FROM items WHERE id = ?`)
    .bind(id)
    .run();

  if (result.success) {
    return Response.json({
headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},      success: true,
    });
  } else {
    return Response.json({
      Headers: { "Content-Type": "application/json" },  
      success: false,
      message: "Failed to delete item",
    }, { status: 500 });
  }
}
export async function getitems(request: Request, env: any) {
  const { results } = await env.DB.prepare(
        `SELECT * FROM items ORDER BY id DESC`
      ).all();

      return Response.json({
  headers: {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
},        items: results
      });
}