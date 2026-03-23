import { hasuraQuery } from "./hasura";
import {
  GET_INTERN_BY_ID,
  GET_TASK_ASSIGNMENTS_BY_TASK_ID,
  GET_TASK_BY_ID,
  GET_USER_BY_EMAIL,
  GET_USER_BY_ID,
} from "./graphql/queries";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  department?: string;
};

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

function toUser(row: UserRow): AppUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password_hash,
    role: row.role,
    department: row.department || "",
  };
}

export function mapInternRow(row: InternRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    department: row.department || "",
    mentorId: row.mentor_id || "",
    adminId: row.admin_id || "",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    status: row.status,
    collegeName: row.college_name || "",
    university: row.university || "",
  };
}

export function mapTaskRow(row: TaskRow) {
  const assignedInterns = (row.task_assignments || []).map((a) => a.intern_id);
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    assignedBy: row.assigned_by,
    assignedToAll: row.assigned_to_all,
    assignedInterns,
    assignedIntern: assignedInterns[0] || "",
    deadline: row.deadline || "",
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getUserById(userId: string) {
  const data = await hasuraQuery<{ users_by_pk: UserRow | null }>(GET_USER_BY_ID, {
    id: userId,
  });

  return data.users_by_pk ? toUser(data.users_by_pk) : null;
}

export async function getUserByEmail(email: string) {
  const data = await hasuraQuery<{ users: UserRow[] }>(GET_USER_BY_EMAIL, {
    email: email.toLowerCase(),
  });

  return data.users.length > 0 ? toUser(data.users[0]) : null;
}

export async function getInternById(internId: string) {
  const data = await hasuraQuery<{ interns_by_pk: InternRow | null }>(GET_INTERN_BY_ID, {
    id: internId,
  });

  return data.interns_by_pk ? mapInternRow(data.interns_by_pk) : null;
}

export async function getTaskById(taskId: string) {
  const data = await hasuraQuery<{ tasks_by_pk: TaskRow | null }>(GET_TASK_BY_ID, {
    id: taskId,
  });

  if (!data.tasks_by_pk) {
    return null;
  }

  const assignmentData = await hasuraQuery<{ task_assignments: Array<{ intern_id: string }> }>(
    GET_TASK_ASSIGNMENTS_BY_TASK_ID,
    { taskId }
  );

  return mapTaskRow({
    ...data.tasks_by_pk,
    task_assignments: assignmentData.task_assignments,
  });
}

export function generateId() {
  return Math.random().toString(36).slice(2, 11);
}
