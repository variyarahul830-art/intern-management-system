import { generateId, mapInternRow } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  EXISTING_USER_BY_EMAIL,
  EXISTING_USER_BY_ID,
  GET_ALL_INTERNS,
  GET_INTERN_PROFILE,
  GET_MENTOR_INTERNS,
} from "@/lib/graphql/queries";
import { CREATE_INTERN_AND_USER } from "@/lib/graphql/mutations";
import { hash } from "bcryptjs";

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function generatePassword() {
  return `Pass@${randomSuffix(8)}`;
}

type InternRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  mentor_id?: string;
  admin_id?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  college_name?: string;
  university?: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole === "admin") {
      const data = await hasuraQuery<{ interns: InternRow[] }>(GET_ALL_INTERNS);

      return NextResponse.json(data.interns.map(mapInternRow));
    }

    if (userRole === "mentor") {
      const data = await hasuraQuery<{ interns: InternRow[] }>(
        GET_MENTOR_INTERNS,
        { mentorId: userId }
      );

      return NextResponse.json(data.interns.map(mapInternRow));
    }

    if (userRole === "intern") {
      const data = await hasuraQuery<{ interns: InternRow[] }>(
        GET_INTERN_PROFILE,
        { id: userId }
      );

      return NextResponse.json(data.interns.map(mapInternRow));
    }

    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch interns" },
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

    const data = await request.json();

    const normalizedEmail = String(data?.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingEmail = await hasuraQuery<{ users: Array<{ id: string }> }>(
      EXISTING_USER_BY_EMAIL,
      { email: normalizedEmail }
    );

    if (existingEmail.users.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    let internId = `intern-${generateId()}`;
    while (true) {
      const existingId = await hasuraQuery<{ users_by_pk: { id: string } | null }>(
        EXISTING_USER_BY_ID,
        { id: internId }
      );

      if (!existingId.users_by_pk) {
        break;
      }
      internId = `intern-${generateId()}`;
    }

    const plainPassword = generatePassword();
    const hashedPassword = await hash(plainPassword, 10);

    const department = String(data?.department || "").trim().toUpperCase();
    const name = String(data?.name || "").trim();

    const inserted = await hasuraMutation<{ insert_interns_one: InternRow }>(
      CREATE_INTERN_AND_USER,
      {
        id: internId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "intern",
        department,
        phone: data?.phone || null,
        mentorId: data?.mentorId || null,
        startDate: data?.startDate || null,
        internStatus: "active",
        collegeName: data?.collegeName || null,
        university: data?.university || data?.collegeName || null,
        adminId: (session.user as any)?.id || null,
      }
    );

    const newIntern = mapInternRow(inserted.insert_interns_one);

    return NextResponse.json(
      {
        intern: newIntern,
        credentials: {
          id: internId,
          password: plainPassword,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create intern" },
      { status: 500 }
    );
  }
}
