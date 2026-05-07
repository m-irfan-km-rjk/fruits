import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export async function hashPassword(password: string) {
    const buffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(password)
    );
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

export async function createToken(payload: any, secret: string) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(encoder.encode(secret));
}

export async function verifyToken(token: string, secret: string) {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload;
}

export async function requireAuth(req: Request, env: any) {
    const header = req.headers.get("Authorization");
    if (!header) return null;
    const token = header.replace("Bearer ", "");
    try {
        return await verifyToken(token, env.JWT_SECRET);
    } catch {
        return null;
    }
}

export async function login(req: Request, env: any) {
    const { email, password } = await req.json() as any;

    if (!email || !password) {
        return Response.json({ error: "Email and password required" }, { status: 400 });
    }

    const result = await env.DB.prepare(
        "SELECT * FROM user WHERE email = ?"
    ).bind(email).first();

    if (!result) return Response.json({ error: "User not found" }, { status: 401 });

    const hashedInput = await hashPassword(password);

    if (hashedInput !== result.password) {
        return Response.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createToken(
        { user_id: result.id, email: result.email },
        env.JWT_SECRET
    );

    return new Response(
        JSON.stringify({ token }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}

export async function createUser(req: Request, env: any) {
    /*const user = requireAuth(req, env);

    if (!user || (user.email != "admin")) {
        return new Response(
            JSON.stringify({ "error": "Unauthorized" }),
            {
                status: 401,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }*/

    const { email, password } = req.json();

    if (!email && !password) {
        return new Response(
            JSON.stringify({ error: "Email and Password required" }),
            {
                status: 400,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }

    //Add user
    const id = crypto.randomUUID();

    // 🔐 hash password
    const hashedPassword = await hashPassword(password);

    env.DB.prepare("INSERT INTO user (id, email, password) VALUES (?,?,?)").bind(id, email, hashedPassword).run();

    return new Response(
        JSON.stringify({ success: true, message: "User created successfully." }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
}