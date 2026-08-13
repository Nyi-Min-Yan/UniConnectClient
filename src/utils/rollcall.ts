export type RollCallRecord = {
  rollNo: string;
  studentName: string;
  present: number;
  absent: number;
  total: number;
};

export type SubjectRollCall = {
  subjectName: string;
  totalClasses: number;
  records: RollCallRecord[];
};

export type StudentHitSummary = {
  rollNo: string;
  studentName: string;
  subjectsHit: number;
  totalSubjects: number;
  subjectNames: string[];
  totalPresent: number;
  totalClasses: number;
  overallPercent: number;
  isRectorCase: boolean;
  recoveryNeeded: number;
};

export type WarningStudent = {
  rollNo: string;
  studentName: string;
  subjectName: string;
  attendancePercent: number;
  remainingAbsences: number;
};

const THRESHOLD = 75;

export function calcAttendance(present: number, total: number): number {
  if (total === 0) return 100;
  return Math.round((present / total) * 1000) / 10;
}

export function remainingAbsencesBeforeHit(present: number, total: number): number {
  if (total === 0) return 0;
  const max = Math.floor((4 * present) / 3 - total);
  return Math.max(0, max);
}

export function recoveryNeeded(present: number, total: number): number {
  const needed = 3 * total - 4 * present;
  return Math.max(0, needed);
}

export function isHit(present: number, total: number): boolean {
  if (total === 0) return false;
  return (present / total) * 100 < THRESHOLD;
}

export function perSubjectHits(subject: SubjectRollCall): RollCallRecord[] {
  return subject.records.filter((r) => isHit(r.present, r.total));
}

export function overallSummaries(subjects: SubjectRollCall[]): StudentHitSummary[] {
  const map = new Map<string, { name: string; totalPresent: number; totalClasses: number; hits: string[] }>();

  for (const subj of subjects) {
    for (const r of subj.records) {
      if (!map.has(r.rollNo)) {
        map.set(r.rollNo, { name: r.studentName, totalPresent: 0, totalClasses: 0, hits: [] });
      }
      const entry = map.get(r.rollNo)!;
      entry.totalPresent += r.present;
      entry.totalClasses += r.total;
      if (isHit(r.present, r.total)) {
        entry.hits.push(subj.subjectName);
      }
    }
  }

  const summaries: StudentHitSummary[] = [];
  for (const [rollNo, entry] of map) {
    const overallPercent = calcAttendance(entry.totalPresent, entry.totalClasses);
    const recovery = recoveryNeeded(entry.totalPresent, entry.totalClasses);
    summaries.push({
      rollNo,
      studentName: entry.name,
      subjectsHit: entry.hits.length,
      totalSubjects: subjects.length,
      subjectNames: entry.hits,
      totalPresent: entry.totalPresent,
      totalClasses: entry.totalClasses,
      overallPercent,
      isRectorCase: overallPercent < THRESHOLD,
      recoveryNeeded: recovery,
    });
  }

  return summaries.sort((a, b) => a.overallPercent - b.overallPercent);
}

export function warningList(subjects: SubjectRollCall[]): WarningStudent[] {
  const warnings: WarningStudent[] = [];
  for (const subj of subjects) {
    for (const r of subj.records) {
      const pct = calcAttendance(r.present, r.total);
      const remain = remainingAbsencesBeforeHit(r.present, r.total);
      if (pct >= THRESHOLD && pct < 85 && remain <= 2) {
        warnings.push({
          rollNo: r.rollNo,
          studentName: r.studentName,
          subjectName: subj.subjectName,
          attendancePercent: pct,
          remainingAbsences: remain,
        });
      }
    }
  }
  return warnings;
}

export function mapAttendanceToSubjectRollCalls(
  attendance: Array<{
    studentId: string;
    studentName: string;
    rollNo: string;
    courseCode: string;
    present: number;
    total: number;
  }>
): SubjectRollCall[] {
  const grouped = new Map<string, { totalClasses: number; records: RollCallRecord[] }>();

  for (const record of attendance) {
    if (!grouped.has(record.courseCode)) {
      grouped.set(record.courseCode, { totalClasses: record.total, records: [] });
    }
    const group = grouped.get(record.courseCode)!;
    group.records.push({
      rollNo: record.rollNo,
      studentName: record.studentName,
      present: record.present,
      absent: record.total - record.present,
      total: record.total,
    });
  }

  const result: SubjectRollCall[] = [];
  for (const [subjectName, group] of grouped) {
    result.push({
      subjectName,
      totalClasses: group.totalClasses,
      records: group.records,
    });
  }

  return result;
}