import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  EXISTING_USER_BY_EMAIL,
  EXISTING_USER_BY_ID,
  GET_USERS,
} from "@/lib/graphql/queries";
import { CREATE_USER } from "@/lib/graphql/mutations";
import { hash } from "bcryptjs";

const DEPARTMENTS = ["AI", "ODOO", "JAVA", "MOBILE"];

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function generateUserId(role: "mentor" | "intern") {
  return `${role}-${randomSuffix(7)}`;
}

function generatePassword() {
  return `Pass@${randomSuffix(8)}`;
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  department?: string;
};

export async function GET() {
  try {
    const data = await hasuraQuery<{ users: UserRow[] }>(GET_USERS);

    const safeUsers = data.users.map(({ password_hash, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const role = body?.role;
    const department = String(body?.department || "").trim().toUpperCase();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    if (role !== "mentor" && role !== "intern") {
      return NextResponse.json(
        { error: "Only mentor or intern accounts can be created" },
        { status: 400 }
      );
    }

    if (!DEPARTMENTS.includes(department)) {
      return NextResponse.json(
        { error: "Invalid department" },
        { status: 400 }
      );
    }

    const existingEmail = await hasuraQuery<{ users: Array<{ id: string }> }>(
      EXISTING_USER_BY_EMAIL,
      { email }
    );

    if (existingEmail.users.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    let id = generateUserId(role);
    while (true) {
      const existingId = await hasuraQuery<{ users_by_pk: { id: string } | null }>(
        EXISTING_USER_BY_ID,
        { id }
      );

      if (!existingId.users_by_pk) {
        break;
      }
      id = generateUserId(role);
    }

    const plainPassword = generatePassword();
    const hashedPassword = await hash(plainPassword, 10);

    const inserted = await hasuraMutation<{ insert_users_one: UserRow }>(CREATE_USER, {
      id,
      name,
      email,
      password: hashedPassword,
      role,
      department,
    });

    const { password_hash, ...safeUser } = inserted.insert_users_one;

    return NextResponse.json(
      {
        user: safeUser,
        credentials: {
          id,
          password: plainPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create user", details: message },
      { status: 500 }
    );
  }
}
