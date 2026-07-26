export type Student = {
  id: number;
  rollNo: string;
  name: string;
  semester: number;
  department: string;
  email: string;
  major: "CS" | "CT" | "CST";
};

export type Staff = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: "admin" | "finance" | "sa" | "itsm";
  staffId: string;
  phone: string;
};

export const MAJORS = ["CS", "CT", "CST"] as const;

export const MAJOR_LABELS: Record<string, string> = {
  CS: "Computer Science",
  CT: "Computer Technology",
  CST: "Computer Science & Technology",
};

export const STAFF_DEPARTMENTS = [
  { id: "admin", name: "Administration" },
  { id: "finance", name: "Finance" },
  { id: "sa", name: "Student Affairs" },
  { id: "itsm", name: "IT supporting and maintenance" },
];

export type ExamResult = {
  id: number;
  fileName: string;
  studentId: number;
  rollNo: string;
  studentName: string;
  semester: number;
  year: string;
  uploadedAt: string;
  sent: boolean;
  sentAt: string | null;
};

export const DEPARTMENTS = [
  "Computer Science",
  "Business Administration",
  "Engineering",
  "Psychology",
  "Design",
  "Mathematics",
];

const FIRST_NAMES = [
  "Sarah", "Marcus", "Emily", "David", "Lisa", "Alex", "Jessica", "Kevin",
  "Amanda", "Brandon", "Rachel", "Tyler", "Megan", "Justin", "Lauren",
  "Nathan", "Victoria", "Daniel", "Sophia", "Ryan",
];

const LAST_NAMES = [
  "Chen", "Johnson", "Rodriguez", "Kim", "Thompson", "Wong", "Patel",
  "Martinez", "Wilson", "Brown", "Davis", "Miller", "Garcia", "Lee",
  "Wang", "Anderson", "Taylor", "Thomas", "Jackson", "White",
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pickDeterministic<T>(arr: T[], seed: number): T {
  const idx = Math.floor(seededRandom(seed) * arr.length);
  return arr[idx];
}

function generateStudent(id: number, semester: number): Student {
  const firstName = pickDeterministic(FIRST_NAMES, id * 7 + semester * 3);
  const lastName = pickDeterministic(LAST_NAMES, id * 11 + semester * 5);
  const department = pickDeterministic(DEPARTMENTS, id * 13 + semester * 7);
  const majorIdx = Math.floor(seededRandom(id * 17 + semester * 11) * 3);
  const majors: Student["major"][] = ["CS", "CT", "CST"];
  const rollNum = String(1000 + id).padStart(4, "0");
  return {
    id,
    rollNo: `UCSTGO-${rollNum}`,
    name: `${firstName} ${lastName}`,
    semester,
    department,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@uni.edu`,
    major: majors[majorIdx],
  };
}

export function generateStudents(): Student[] {
  const students: Student[] = [];
  let id = 1;
  for (let sem = 1; sem <= 8; sem++) {
    const count = sem <= 2 ? 6 : sem <= 4 ? 5 : 4;
    for (let i = 0; i < count; i++) {
      students.push(generateStudent(id++, sem));
    }
  }
  return students;
}

export const STUDENTS = generateStudents();

export function getYearBySemester(semester: number): number {
  return Math.ceil(semester / 2);
}

export function getStudentsByYear(year: number): Student[] {
  return STUDENTS.filter((s) => getYearBySemester(s.semester) === year);
}

export const YEAR_LABELS: Record<number, string> = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
};

export type LibraryRecord = {
  rollNo: string;
  hasOverdueBooks: boolean;
  overdueCount: number;
};

export function generateLibraryRecords(): LibraryRecord[] {
  return STUDENTS.map((s) => ({
    rollNo: s.rollNo,
    hasOverdueBooks: s.id % 7 === 0 || s.id % 13 === 0,
    overdueCount: s.id % 7 === 0 || s.id % 13 === 0 ? (s.id % 3) + 1 : 0,
  }));
}

export const LIBRARY_RECORDS = generateLibraryRecords();

export function getLibraryStatus(rollNo: string): LibraryRecord {
  return LIBRARY_RECORDS.find((r) => r.rollNo === rollNo) || { rollNo, hasOverdueBooks: false, overdueCount: 0 };
}

export function extractRollNoFromFilename(filename: string): string | null {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const digits = withoutExt.match(/(\d{4,})/);
  if (digits) {
    const padded = digits[1].slice(0, 4).padStart(4, "0");
    return `UCSTGO-${padded}`;
  }
  if (withoutExt.match(/UCSTGO/i)) {
    const match = withoutExt.match(/UCSTGO[-_ ]?(\d{1,4})/i);
    if (match) {
      return `UCSTGO-${match[1].padStart(4, "0")}`;
    }
  }
  return null;
}

export function extractNamesFromFilename(filename: string): string[] {
  const withoutExt = filename.replace(/\.[^.]+$/, "");
  const parts = withoutExt.split(/[-_ ]+/).filter(Boolean);
  const knownNames: string[] = [];
  for (const s of STUDENTS) {
    for (const part of parts) {
      if (s.name.toLowerCase().includes(part.toLowerCase()) && part.length > 2) {
        knownNames.push(s.name);
        break;
      }
    }
    const nameParts = s.name.toLowerCase().split(" ");
    for (const part of parts) {
      if (nameParts.includes(part.toLowerCase()) && part.length > 2) {
        knownNames.push(s.name);
        break;
      }
    }
  }
  return [...new Set(knownNames)];
}

export function findStudentByRollNo(rollNo: string): Student | undefined {
  return STUDENTS.find((s) => s.rollNo === rollNo);
}

export function findStudentByName(query: string): Student[] {
  const lower = query.toLowerCase();
  return STUDENTS.filter(
    (s) => s.name.toLowerCase().includes(lower) || s.rollNo.toLowerCase().includes(lower)
  );
}

export type DepartmentStats = {
  department: string;
  studentCount: number;
  semesterDistribution: Record<number, number>;
};

export function getDepartmentStats(): DepartmentStats[] {
  const map = new Map<string, Record<number, number>>();
  for (const s of STUDENTS) {
    if (!map.has(s.department)) map.set(s.department, {});
    const dist = map.get(s.department)!;
    dist[s.semester] = (dist[s.semester] || 0) + 1;
  }
  return Array.from(map.entries()).map(([department, semesterDistribution]) => ({
    department,
    studentCount: Object.values(semesterDistribution).reduce((a, b) => a + b, 0),
    semesterDistribution,
  })).sort((a, b) => b.studentCount - a.studentCount);
}
