import { gql } from "@apollo/client/core";

export const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    users_by_pk(id: $id) {
      id
      name
      email
      password_hash
      role
      department
    }
  }
`;

export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }, limit: 1) {
      id
      name
      email
      password_hash
      role
      department
    }
  }
`;

export const GET_INTERN_BY_ID = gql`
  query GetInternById($id: String!) {
    interns_by_pk(id: $id) {
      id
      name
      email
      phone
      department
      mentor_id
      admin_id
      start_date
      end_date
      status
      college_name
      university
    }
  }
`;

export const GET_TASK_BY_ID = gql`
  query GetTaskById($id: String!) {
    tasks_by_pk(id: $id) {
      id
      title
      description
      assigned_by
      assigned_to_all
      deadline
      priority
      status
      created_at
    }
  }
`;

export const GET_TASK_ASSIGNMENTS_BY_TASK_ID = gql`
  query GetTaskAssignmentsByTaskId($taskId: String!) {
    task_assignments(where: { task_id: { _eq: $taskId } }) {
      intern_id
    }
  }
`;

export const GET_TASK_ASSIGNMENTS_BY_TASK_IDS = gql`
  query GetTaskAssignmentsByTaskIds($taskIds: [String!]!) {
    task_assignments(where: { task_id: { _in: $taskIds } }) {
      task_id
      intern_id
    }
  }
`;

export const GET_TASK_IDS_FOR_INTERN = gql`
  query GetTaskIdsForIntern($internId: String!) {
    task_assignments(where: { intern_id: { _eq: $internId } }) {
      task_id
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users(order_by: { created_at: desc }) {
      id
      name
      email
      password_hash
      role
      department
    }
  }
`;

export const EXISTING_USER_BY_EMAIL = gql`
  query ExistingUserByEmail($email: String!) {
    users(where: { email: { _eq: $email } }, limit: 1) {
      id
    }
  }
`;

export const EXISTING_USER_BY_ID = gql`
  query ExistingUserById($id: String!) {
    users_by_pk(id: $id) {
      id
    }
  }
`;

export const GET_ALL_INTERNS = gql`
  query GetAllInterns {
    interns(order_by: { created_at: desc }) {
      id
      name
      email
      phone
      department
      mentor_id
      admin_id
      start_date
      end_date
      status
      college_name
      university
    }
  }
`;

export const GET_MENTOR_INTERNS = gql`
  query GetMentorInterns($mentorId: String!) {
    interns(where: { mentor_id: { _eq: $mentorId } }, order_by: { created_at: desc }) {
      id
      name
      email
      phone
      department
      mentor_id
      admin_id
      start_date
      end_date
      status
      college_name
      university
    }
  }
`;

export const GET_INTERN_PROFILE = gql`
  query GetInternProfile($id: String!) {
    interns(where: { id: { _eq: $id } }, limit: 1) {
      id
      name
      email
      phone
      department
      mentor_id
      admin_id
      start_date
      end_date
      status
      college_name
      university
    }
  }
`;

export const GET_CREATOR_TASKS = gql`
  query GetCreatorTasks($creatorId: String!) {
    tasks(where: { assigned_by: { _eq: $creatorId } }, order_by: { created_at: desc }) {
      id
      title
      description
      assigned_by
      assigned_to_all
      deadline
      priority
      status
      created_at
    }
  }
`;

export const GET_INTERN_TASKS = gql`
  query GetInternTasks($taskIds: [String!]!) {
    tasks(
      where: {
        _or: [
          { assigned_to_all: { _eq: true } }
          { id: { _in: $taskIds } }
        ]
      }
      order_by: { created_at: desc }
    ) {
      id
      title
      description
      assigned_by
      assigned_to_all
      deadline
      priority
      status
      created_at
    }
  }
`;

export const GET_ALL_INTERN_IDS = gql`
  query GetAllInternIds {
    interns {
      id
    }
  }
`;

export const GET_ALL_REPORTS = gql`
  query GetAllReports {
    reports(order_by: { submitted_at: desc }) {
      id
      intern_id
      report_date
      work_description
      hours_worked
      mentor_feedback
      submitted_at
    }
  }
`;

export const GET_MENTOR_INTERN_IDS = gql`
  query GetMentorInternIds($mentorId: String!) {
    interns(where: { mentor_id: { _eq: $mentorId } }) {
      id
    }
  }
`;

export const GET_MENTOR_REPORTS = gql`
  query GetMentorReports($internIds: [String!]!) {
    reports(
      where: { intern_id: { _in: $internIds } }
      order_by: { submitted_at: desc }
    ) {
      id
      intern_id
      report_date
      work_description
      hours_worked
      mentor_feedback
      submitted_at
    }
  }
`;

export const GET_INTERN_REPORTS = gql`
  query GetInternReports($internId: String!) {
    reports(where: { intern_id: { _eq: $internId } }, order_by: { submitted_at: desc }) {
      id
      intern_id
      report_date
      work_description
      hours_worked
      mentor_feedback
      submitted_at
    }
  }
`;

export const GET_REPORT_BY_ID = gql`
  query GetReportById($id: String!) {
    reports_by_pk(id: $id) {
      id
      intern_id
      report_date
      work_description
      hours_worked
      mentor_feedback
      submitted_at
    }
  }
`;
