import { gql } from "@apollo/client/core";

export const CREATE_USER = gql`
  mutation CreateUser(
    $id: String!
    $name: String!
    $email: String!
    $password: String!
    $role: user_role!
    $department: String!
  ) {
    insert_users_one(
      object: {
        id: $id
        name: $name
        email: $email
        password_hash: $password
        role: $role
        department: $department
      }
    ) {
      id
      name
      email
      password_hash
      role
      department
    }
  }
`;

export const CREATE_INTERN_AND_USER = gql`
  mutation CreateInternAndUser(
    $id: String!
    $name: String!
    $email: String!
    $password: String!
    $role: user_role!
    $department: String!
    $phone: String
    $mentorId: String
    $startDate: date
    $internStatus: intern_status!
    $collegeName: String
    $university: String
    $adminId: String
  ) {
    insert_users_one(
      object: {
        id: $id
        name: $name
        email: $email
        password_hash: $password
        role: $role
        department: $department
      }
    ) {
      id
    }
    insert_interns_one(
      object: {
        id: $id
        name: $name
        email: $email
        phone: $phone
        department: $department
        mentor_id: $mentorId
        admin_id: $adminId
        start_date: $startDate
        status: $internStatus
        college_name: $collegeName
        university: $university
      }
    ) {
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

export const UPDATE_INTERN_AND_USER = gql`
  mutation UpdateInternAndUser(
    $id: String!
    $name: String!
    $email: String!
    $department: String
    $phone: String
    $mentorId: String
    $adminId: String
    $startDate: date
    $endDate: date
    $status: intern_status
    $collegeName: String
    $university: String
  ) {
    update_users_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        email: $email
        department: $department
      }
    ) {
      id
    }
    update_interns_by_pk(
      pk_columns: { id: $id }
      _set: {
        name: $name
        email: $email
        phone: $phone
        department: $department
        mentor_id: $mentorId
        admin_id: $adminId
        start_date: $startDate
        end_date: $endDate
        status: $status
        college_name: $collegeName
        university: $university
      }
    ) {
      id
    }
  }
`;

export const DELETE_INTERN_AND_USER = gql`
  mutation DeleteInternAndUser($id: String!) {
    delete_interns_by_pk(id: $id) {
      id
    }
    delete_users_by_pk(id: $id) {
      id
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask(
    $id: String!
    $title: String!
    $description: String
    $assignedBy: String!
    $assignedToAll: Boolean!
    $deadline: date
    $priority: task_priority!
    $status: task_status!
  ) {
    insert_tasks_one(
      object: {
        id: $id
        title: $title
        description: $description
        assigned_by: $assignedBy
        assigned_to_all: $assignedToAll
        deadline: $deadline
        priority: $priority
        status: $status
      }
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

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($id: String!, $status: task_status!) {
    update_tasks_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

export const UPDATE_TASK_BY_CREATOR = gql`
  mutation UpdateTaskByCreator(
    $id: String!
    $title: String
    $description: String
    $deadline: date
    $priority: task_priority
    $status: task_status
    $assignedToAll: Boolean
  ) {
    update_tasks_by_pk(
      pk_columns: { id: $id }
      _set: {
        title: $title
        description: $description
        deadline: $deadline
        priority: $priority
        status: $status
        assigned_to_all: $assignedToAll
      }
    ) {
      id
    }
  }
`;

export const REPLACE_TASK_ASSIGNMENTS = gql`
  mutation ReplaceTaskAssignments($taskId: String!) {
    delete_task_assignments(where: { task_id: { _eq: $taskId } }) {
      affected_rows
    }
  }
`;

export const INSERT_TASK_ASSIGNMENTS = gql`
  mutation InsertTaskAssignments($objects: [task_assignments_insert_input!]!) {
    insert_task_assignments(objects: $objects) {
      affected_rows
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: String!) {
    delete_tasks_by_pk(id: $id) {
      id
    }
  }
`;

export const CREATE_REPORT = gql`
  mutation CreateReport(
    $id: String!
    $internId: String!
    $reportDate: date!
    $workDescription: String!
    $hoursWorked: numeric!
  ) {
    insert_reports_one(
      object: {
        id: $id
        intern_id: $internId
        report_date: $reportDate
        work_description: $workDescription
        hours_worked: $hoursWorked
      }
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

export const UPDATE_REPORT = gql`
  mutation UpdateReport(
    $id: String!
    $reportDate: date
    $workDescription: String
    $hoursWorked: numeric
    $mentorFeedback: String
  ) {
    update_reports_by_pk(
      pk_columns: { id: $id }
      _set: {
        report_date: $reportDate
        work_description: $workDescription
        hours_worked: $hoursWorked
        mentor_feedback: $mentorFeedback
      }
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
