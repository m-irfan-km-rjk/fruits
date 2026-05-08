const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
}; 
export async function postitems(request, env) {
  try {
    const formdata = await request.formData();

    const id = formdata.get("id");
    const name = formdata.get("name");
    const price = Number(formdata.get("price"));
    const quantity = Number(formdata.get("quantity") ?? 0);
    const image = formdata.get("image");

    if (!id || !name || isNaN(price)) {
      return new Response(JSON.stringify({
        success: false,
        message: "Invalid input"
      }), { status: 400 });
    }
    
  const object = await env.DB.prepare(
      `SELECT * FROM items WHERE id = ?`
    ).bind(id).first();

if (object) {
  return new Response("Item already exists", { status: 409 });
}    
    let imageUrl = null;

    if (image && typeof image !== "string") {
      const imageKey = `images/${id}`;
      console.log("Uploading image to R2 with key:", env.friuts);
      await env.friuts.put(imageKey, image);
      imageUrl = `https://pub-c6af304c8e664fe5bcd74ee4f5adfb78.r2.dev/${imageKey}`;
    }
    const result = await env.DB.prepare(
      `INSERT INTO items (id, name, price, quantity, image)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(id, name, price, quantity, imageUrl ?? "").run();

    return Response.json({ success: result.success });

  } catch (err) {
    return Response.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
export async function putitem(request, env) {
  try {
    const id = new URL(request.url).pathname.split("/")[2];
    const object = await env.DB.prepare(
      `SELECT * FROM items WHERE id = ?`
    ).bind(id).first();
    if (!object) return new Response("Not found", { status: 404 });
    const formdata = await request.formData();
    const name = formdata.get("name") as string;
    const price = Number(formdata.get("price"));
    const quantity = Number(formdata.get("quantity"));
    const image = formdata.get("image") as File;
    let imageUrl = null;
    
    if (image) {
      if (object.image) {
        console.log("Deleting old image from R2 with key:", object.image);
        const key = env.friuts.get(object.image.split(".r2.dev/")[1]);
        console.log("Key to delete:", key);
        await env.friuts.delete(key);
      }
      const imageKey = `images/${id}-${image.name}`;
      await env.friuts.put(imageKey, image);
      imageUrl = `https://pub-c6af304c8e664fe5bcd74ee4f5adfb78.r2.dev/${imageKey}`; 
      }
    const result = await env.DB.prepare(
      `UPDATE items
       SET name = ?, price = ?, quantity = ?, image = ?
       WHERE id = ?`
    ).bind(name, price, quantity, imageUrl ?? "", id).run();

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
    const image = await env.DB.prepare(
      `SELECT image FROM items WHERE id = ?`
    ).bind(id).first();
    if (image != null) {
     const key = image.image.split(".r2.dev/")[1];
     await env.friuts.delete(key);
  }

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