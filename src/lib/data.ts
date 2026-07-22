export type Student = {
  id: number;
  rollNo: string;
  name: string;
  semester: number;
  department: string;
  email: string;
};

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
  const rollNum = String(1000 + id).padStart(4, "0");
  return {
    id,
    rollNo: `UCSTGO-${rollNum}`,
    name: `${firstName} ${lastName}`,
    semester,
    department,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@uni.edu`,
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

export function getStudentsBySemester(semester: number): Student[] {
  return STUDENTS.filter((s) => s.semester === semester);
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
