import { generateId, getTaskById, mapTaskRow } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  GET_ALL_INTERN_IDS,
  GET_CREATOR_TASKS,
  GET_INTERN_TASKS,
  GET_TASK_ASSIGNMENTS_BY_TASK_IDS,
  GET_TASK_IDS_FOR_INTERN,
} from "@/lib/graphql/queries";
import { CREATE_TASK, INSERT_TASK_ASSIGNMENTS } from "@/lib/graphql/mutations";

type TaskRow = {
  id: string;
  title: string;
  description?: string;
  assigned_by: string;
  assigned_to_all: boolean;
  deadline?: string;
  priority: string;
  status: string;
  created_at: string;
  task_assignments?: Array<{ intern_id: string }>;
};

type TaskAssignmentRow = {
  task_id: string;
  intern_id: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session?.user ? (session.user as any)?.role : null;
    const userId = session?.user ? (session.user as any)?.id : null;

    if (userRole === "admin" || userRole === "mentor") {
      const data = await hasuraQuery<{ tasks: TaskRow[] }>(
        GET_CREATOR_TASKS,
        { creatorId: userId }
      );

      const taskIds = data.tasks.map((t) => t.id);
      const assignmentData =
        taskIds.length > 0
          ? await hasuraQuery<{ task_assignments: TaskAssignmentRow[] }>(
              GET_TASK_ASSIGNMENTS_BY_TASK_IDS,
              { taskIds }
            )
          : { task_assignments: [] };

      const assignmentMap = new Map<string, Array<{ intern_id: string }>>();
      assignmentData.task_assignments.forEach((row) => {
        const current = assignmentMap.get(row.task_id) || [];
        current.push({ intern_id: row.intern_id });
        assignmentMap.set(row.task_id, current);
      });

      const mapped = data.tasks.map((task) =>
        mapTaskRow({
          ...task,
          task_assignments: assignmentMap.get(task.id) || [],
        })
      );

      return NextResponse.json(mapped);
    }

    // Interns only see tasks assigned directly, in multi-assignment, or to all interns
    const taskIdData = await hasuraQuery<{ task_assignments: Array<{ task_id: string }> }>(
      GET_TASK_IDS_FOR_INTERN,
      { internId: userId }
    );

    const assignedTaskIds = taskIdData.task_assignments.map((row) => row.task_id);

    const data = await hasuraQuery<{ tasks: TaskRow[] }>(
      GET_INTERN_TASKS,
      { taskIds: assignedTaskIds }
    );

    const taskIds = data.tasks.map((t) => t.id);
    const assignmentData =
      taskIds.length > 0
        ? await hasuraQuery<{ task_assignments: TaskAssignmentRow[] }>(
            GET_TASK_ASSIGNMENTS_BY_TASK_IDS,
            { taskIds }
          )
        : { task_assignments: [] };

    const assignmentMap = new Map<string, Array<{ intern_id: string }>>();
    assignmentData.task_assignments.forEach((row) => {
      const current = assignmentMap.get(row.task_id) || [];
      current.push({ intern_id: row.intern_id });
      assignmentMap.set(row.task_id, current);
    });

    const mapped = data.tasks.map((task) =>
      mapTaskRow({
        ...task,
        task_assignments: assignmentMap.get(task.id) || [],
      })
    );

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "admin" && userRole !== "mentor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const assignedInternInput: unknown[] = Array.isArray(data.assignedInterns)
      ? data.assignedInterns
      : [];

    const normalizedAssignedInterns: string[] = [
      ...new Set(
        assignedInternInput
          .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
          .map((id) => id.trim())
      ),
    ];

    const assignedToAll = Boolean(data.assignedToAll);
    let assignedInterns = normalizedAssignedInterns;

    if (assignedToAll) {
      const internData = await hasuraQuery<{ interns: Array<{ id: string }> }>(
        GET_ALL_INTERN_IDS
      );
      assignedInterns = internData.interns.map((intern) => intern.id);
    } else if (assignedInterns.length === 0 && data.assignedIntern) {
      assignedInterns = [data.assignedIntern];
    }

    if (!assignedToAll && assignedInterns.length === 0) {
      return NextResponse.json(
        { error: "At least one intern must be selected" },
        { status: 400 }
      );
    }

    const taskId = generateId();
    const creatorId = (session.user as any)?.id;

    const inserted = await hasuraMutation<{ insert_tasks_one: TaskRow }>(
      CREATE_TASK,
      {
        id: taskId,
        title: String(data?.title || "").trim(),
        description: data?.description || null,
        assignedBy: creatorId,
        assignedToAll,
        deadline: data?.deadline || null,
        priority: String(data?.priority || "medium").toLowerCase(),
        status: String(data?.status || "pending").toLowerCase(),
      }
    );

    if (assignedInterns.length > 0) {
      await hasuraMutation<{ insert_task_assignments: { affected_rows: number } }>(
        INSERT_TASK_ASSIGNMENTS,
        {
          objects: assignedInterns.map((internId: string) => ({
            task_id: taskId,
            intern_id: internId,
          })),
        }
      );
    }

    const newTask = await getTaskById(taskId);

    return NextResponse.json(
      newTask ||
        mapTaskRow({
          ...inserted.insert_tasks_one,
          task_assignments: assignedInterns.map((internId) => ({ intern_id: internId })),
        }),
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create task", details: message },
      { status: 500 }
    );
  }
}
