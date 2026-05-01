const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
}; 
export async function postitems(request, env) {
  try {
    const body = await request.json();
    const { id, name, price, quantity, image } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: "ID is required" }), { status: 400, headers });
    }
    if (!name) {
      return new Response(JSON.stringify({ success: false, message: "Name is required" }), { status: 400, headers });
    }
    if (price == null) {
      return new Response(JSON.stringify({ success: false, message: "Price is required" }), { status: 400, headers });
    }

    const result = await env.DB.prepare(
      `INSERT INTO items (id, name, price, quantity, image)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(id, name, price, quantity ?? 0, image ?? "").run();

    if (!result.success) {
      return new Response(JSON.stringify({ success: false }), { status: 500, headers });
    }

    const item = await env.DB.prepare(
      `SELECT id, name, price, quantity, image FROM items WHERE id = ?`
    ).bind(id).first();

    return new Response(JSON.stringify({ success: true, item }), {
      status: 201,
      headers,
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers });
  }
}
export async function putitem(request, env) {
  try {
    const id = new URL(request.url).pathname.split("/")[2];
    const { name, price, quantity, image } = await request.json();

    const result = await env.DB.prepare(
      `UPDATE items
       SET name = ?, price = ?, quantity = ?, image = ?
       WHERE id = ?`
    ).bind(name, price, quantity, image, id).run();

    return new Response(JSON.stringify({
      success: result.success
    }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers });
  }
}
export async function deleteitem(request, env) {
  try {
    const id = new URL(request.url).pathname.split("/")[2];

    const result = await env.DB.prepare(
      `DELETE FROM items WHERE id = ?`
    ).bind(id).run();

    return new Response(JSON.stringify({
      success: result.success
    }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers });
  }
}
export async function getitems(request, env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM items ORDER BY id DESC`
    ).all();

    return new Response(JSON.stringify({
      success: true,
      items: results
    }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers });
  }
}