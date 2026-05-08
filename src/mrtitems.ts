const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
}; 
export async function postmrtitems(request, env) {
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
    let onupdate = new Date().toISOString();

    const result = await env.DB.prepare(
      `INSERT INTO mrtitems (id, name, price, quantity, image, onupdate)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, name, price, quantity ?? 0, image ?? "", onupdate).run();

    if (!result.success) {
      return new Response(JSON.stringify({ success: false }), { status: 500, headers });
    }

    const item = await env.DB.prepare(
      `SELECT id, name, price, quantity, image FROM mrtitems WHERE id = ?`
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
export async function putmrtitem(request, env) {
  try {
    const id = new URL(request.url).pathname.split("/")[2];
    const { name, price, quantity, image } = await request.json();
    let onupdate = new Date().toISOString();

    const result = await env.DB.prepare(
      `UPDATE mrtitems
       SET name = ?, price = ?, quantity = ?, image = ?, onupdate = ?
       WHERE id = ?`
    ).bind(name, price, quantity, image, onupdate, id).run();

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
export async function deletemrtitem(request, env) {
  try {
    const id = new URL(request.url).pathname.split("/")[2];

    const result = await env.DB.prepare(
      `DELETE FROM mrtitems WHERE id = ?`
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
export async function getmrtitems(request, env) {
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM mrtitems ORDER BY id DESC`
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