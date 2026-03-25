import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasuraMutation, hasuraQuery } from "@/lib/hasura";
import { GET_REPORT_BY_ID } from "@/lib/graphql/queries";
import { UPDATE_REPORT } from "@/lib/graphql/mutations";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await hasuraQuery<{ reports_by_pk: ReportRow | null }>(
      GET_REPORT_BY_ID,
      { id }
    );
    const report = data.reports_by_pk;

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(mapReportRow(report));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();
    
    console.log("Update report request:", { id, updates });

    const updated = await hasuraMutation<{ update_reports_by_pk: ReportRow | null }>(
      UPDATE_REPORT,
      {
        id,
        reportDate: updates?.date ?? null,
        workDescription: updates?.workDescription ?? null,
        hoursWorked:
          typeof updates?.hoursWorked === "number"
            ? updates.hoursWorked
            : updates?.hoursWorked
            ? Number(updates.hoursWorked)
            : null,
        mentorFeedback:
          typeof updates?.mentorFeedback === "string"
            ? updates.mentorFeedback
            : null,
      }
    );
    
    console.log("Mutation response:", updated);

    if (!updated.update_reports_by_pk) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(mapReportRow(updated.update_reports_by_pk));
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json(
      { 
        error: "Failed to update report",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
