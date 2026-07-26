import { STUDENTS, type Student, type Staff, MAJORS } from "./data";
import { ALL_USERS, type User } from "./users";

let nextStudentId = STUDENTS.length + 1;
let nextLecturerId = 1001;
let nextStaffId = 1;

let students = [...STUDENTS];
let lecturers = [...ALL_USERS];
let staff: Staff[] = [
  { id: 1, name: "U Myo Min", email: "myo.min@uni.edu", department: "Administration", role: "admin", staffId: "ADM-001", phone: "09-123456001" },
  { id: 2, name: "Daw Hlaing", email: "hlaing@uni.edu", department: "Finance", role: "finance", staffId: "FIN-001", phone: "09-123456002" },
  { id: 3, name: "U Aung Aung", email: "aung.aung@uni.edu", department: "Student Affairs", role: "sa", staffId: "SA-001", phone: "09-123456003" },
  { id: 4, name: "U Kyaw Kyaw", email: "kyaw.kyaw@uni.edu", department: "IT supporting and maintenance", role: "itsm", staffId: "ITSM-001", phone: "09-123456004" },
];

export function getStudents(): Student[] {
  return students;
}

export function getLecturers(): User[] {
  return lecturers;
}

export function getStaff(): Staff[] {
  return staff;
}

export type NewStudentInput = {
  name: string;
  rollNo: string;
  semester: number;
  email: string;
  major: "CS" | "CT" | "CST";
};

export function addStudent(input: NewStudentInput): Student {
  const student: Student = {
    id: nextStudentId++,
    rollNo: input.rollNo,
    name: input.name,
    semester: input.semester,
    department: input.major === "CS" ? "Computer Science" : input.major === "CT" ? "Computer Technology" : "Computing",
    email: input.email,
    major: input.major,
  };
  students = [student, ...students];
  return student;
}

export type NewLecturerInput = {
  name: string;
  email: string;
  department: string;
  faculty: string;
  facultyId: string;
  assignedCourses: string[];
};

const FACULTY_MAP: Record<string, { faculty: string; facultyId: string }> = {
  "Computer Science": { faculty: "Faculty of Computer Science", facultyId: "fcs" },
  "Computer Systems & Technologies": { faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst" },
  "Information Sciences": { faculty: "Faculty of Information Sciences", facultyId: "fis" },
  "Computing": { faculty: "Faculty of Computing", facultyId: "fc" },
  "Language": { faculty: "Department of Language", facultyId: "lang" },
  "Natural Science": { faculty: "Department of Natural Science", facultyId: "ns" },
  "Faculty of Computer Science": { faculty: "Faculty of Computer Science", facultyId: "fcs" },
  "Faculty of Computer Systems & Technologies": { faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst" },
  "Faculty of Information Sciences": { faculty: "Faculty of Information Sciences", facultyId: "fis" },
  "Faculty of Computing": { faculty: "Faculty of Computing", facultyId: "fc" },
  "Department of Language": { faculty: "Department of Language", facultyId: "lang" },
  "Department of Natural Science": { faculty: "Department of Natural Science", facultyId: "ns" },
};

export function addLecturer(input: NewLecturerInput): User {
  const fac = FACULTY_MAP[input.department] || { faculty: input.department, facultyId: input.department.toLowerCase().replace(/\s+/g, "-") };
  const initials = input.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  const lecturer: User = {
    id: nextLecturerId++,
    name: input.name,
    email: input.email,
    role: "teacher",
    department: input.department,
    faculty: input.faculty || fac.faculty,
    facultyId: input.facultyId || fac.facultyId,
    assignedCourses: input.assignedCourses,
    avatar: initials,
  };
  lecturers = [lecturer, ...lecturers];
  return lecturer;
}

export type NewStaffInput = {
  name: string;
  email: string;
  department: string;
  role: Staff["role"];
  phone: string;
};

export function addStaff(input: NewStaffInput): Staff {
  const deptCode = {
    "Administration": "ADM",
    "Finance": "FIN",
    "Student Affairs": "SA",
    "IT supporting and maintenance": "ITSM",
  }[input.department] || "STAFF";

  const count = staff.filter((s) => s.department === input.department).length + 1;
  const member: Staff = {
    id: nextStaffId++,
    name: input.name,
    email: input.email,
    department: input.department,
    role: input.role,
    staffId: `${deptCode}-${String(count).padStart(3, "0")}`,
    phone: input.phone,
  };
  staff = [member, ...staff];
  return member;
}
