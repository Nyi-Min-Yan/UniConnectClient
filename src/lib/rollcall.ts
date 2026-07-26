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

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const SUBJECTS = [
  "Data Structures",
  "Algorithms",
  "Database Systems",
  "Computer Networks",
  "Operating Systems",
  "Software Engineering",
  "Machine Learning",
  "Web Development",
];

const STUDENT_NAMES_MOCK = [
  { roll: "UCSTGO-1001", name: "Sarah Chen" },
  { roll: "UCSTGO-1002", name: "Marcus Johnson" },
  { roll: "UCSTGO-1003", name: "Emily Rodriguez" },
  { roll: "UCSTGO-1004", name: "David Kim" },
  { roll: "UCSTGO-1005", name: "Lisa Thompson" },
  { roll: "UCSTGO-1006", name: "Alex Wong" },
  { roll: "UCSTGO-2001", name: "Jessica Patel" },
  { roll: "UCSTGO-2002", name: "Kevin Martinez" },
  { roll: "UCSTGO-2003", name: "Amanda Wilson" },
  { roll: "UCSTGO-2004", name: "Brandon Brown" },
  { roll: "UCSTGO-2005", name: "Rachel Davis" },
  { roll: "UCSTGO-2006", name: "Tyler Miller" },
  { roll: "UCSTGO-3001", name: "Megan Garcia" },
  { roll: "UCSTGO-3002", name: "Justin Lee" },
  { roll: "UCSTGO-3003", name: "Lauren Wang" },
  { roll: "UCSTGO-3004", name: "Nathan Anderson" },
  { roll: "UCSTGO-3005", name: "Victoria Taylor" },
  { roll: "UCSTGO-4001", name: "Daniel Thomas" },
  { roll: "UCSTGO-4002", name: "Sophia Jackson" },
  { roll: "UCSTGO-4003", name: "Ryan White" },
  { roll: "UCSTGO-4004", name: "Megan Chen" },
];

export function generateMockRollCall(): SubjectRollCall[] {
  const usedPairs = new Set<string>();

  const result: SubjectRollCall[] = [];
  const numSubjects = 4 + Math.floor(Math.random() * 3);

  const selectedSubjects = [...SUBJECTS].sort(() => Math.random() - 0.5).slice(0, numSubjects);

  for (const subjName of selectedSubjects) {
    const totalClasses = 8 + Math.floor(Math.random() * 8);

    const records: RollCallRecord[] = [];
    const numStudents = 10 + Math.floor(Math.random() * 8);
    const shuffled = [...STUDENT_NAMES_MOCK].sort(() => Math.random() - 0.5).slice(0, numStudents);

    for (const s of shuffled) {
      const absent = Math.floor(Math.random() * totalClasses);
      const present = totalClasses - absent;
      const key = `${s.roll}-${subjName}`;
      if (usedPairs.has(key)) continue;
      usedPairs.add(key);
      records.push({
        rollNo: s.roll,
        studentName: s.name,
        present,
        absent,
        total: totalClasses,
      });
    }

    result.push({
      subjectName: subjName,
      totalClasses,
      records,
    });
  }

  return result;
}
