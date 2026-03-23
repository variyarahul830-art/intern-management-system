import { generateId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import {
  GET_ALL_REPORTS,
  GET_INTERN_REPORTS,
  GET_MENTOR_INTERN_IDS,
  GET_MENTOR_REPORTS,
} from "@/lib/graphql/queries";
import { CREATE_REPORT } from "@/lib/graphql/mutations";

type ReportRow = {
  id: string;
  intern_id: string;
  report_date: string;
  work_description: string;
  hours_worked: number;
  mentor_feedback?: string;
  submitted_at: string;
};

function mapReportRow(report: ReportRow) {
  return {
    id: report.id,
    internId: report.intern_id,
    date: report.report_date,
    workDescription: report.work_description,
    hoursWorked: report.hours_worked,
    mentorFeedback: report.mentor_feedback || "",
    submittedAt: report.submitted_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole === "admin") {
      const data = await hasuraQuery<{ reports: ReportRow[] }>(GET_ALL_REPORTS);
      return NextResponse.json(data.reports.map(mapReportRow));
    }

    if (userRole === "mentor") {
      const internData = await hasuraQuery<{ interns: Array<{ id: string }> }>(
        GET_MENTOR_INTERN_IDS,
        { mentorId: userId }
      );

      const assignedInternIds = internData.interns.map((i) => i.id);
      if (assignedInternIds.length === 0) {
        return NextResponse.json([]);
      }

      const reportData = await hasuraQuery<{ reports: ReportRow[] }>(
        GET_MENTOR_REPORTS,
        { internIds: assignedInternIds }
      );

      return NextResponse.json(reportData.reports.map(mapReportRow));
    }

    // Interns see their own reports
    const data = await hasuraQuery<{ reports: ReportRow[] }>(
      GET_INTERN_REPORTS,
      { internId: userId }
    );
    return NextResponse.json(data.reports.map(mapReportRow));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any)?.role !== "intern") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const newReportId = generateId();

    const inserted = await hasuraMutation<{ insert_reports_one: ReportRow }>(
      CREATE_REPORT,
      {
        id: newReportId,
        internId: (session.user as any)?.id,
        reportDate: data?.date,
        workDescription: data?.workDescription,
        hoursWorked: Number(data?.hoursWorked || 0),
      }
    );

    const newReport = mapReportRow(inserted.insert_reports_one);

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
