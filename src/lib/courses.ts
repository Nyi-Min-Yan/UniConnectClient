export type Course = {
  code: string;
  name: string;
  credits: number;
  hasLab: boolean;
  labHours: number;
  hoursPerWeek: number;
  department: string;
  faculty: string;
};

export type CourseYearData = {
  year: number;
  label: string;
  semesters: { semester: 1 | 2; courses: Course[] }[];
};

export function getYearFromCode(code: string): number {
  const match = code.match(/(\d{4})/);
  if (!match) return 1;
  return parseInt(match[1][0]);
}

const YEAR_1_SEM_1: Course[] = [
  { code: "CST-1102", name: "Principle of Information Technology", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CST-1123", name: "Basic Data Processing", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-1141", name: "Calculus", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computing", faculty: "FC" },
  { code: "P-1101", name: "College Physics", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Natural Science", faculty: "NS" },
  { code: "ML-1101", name: "Myanmar Language", credits: 2, hasLab: false, labHours: 0, hoursPerWeek: 2, department: "Language", faculty: "LANG" },
  { code: "EL-1101", name: "English Language", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Language", faculty: "LANG" },
];

const YEAR_1_SEM_2: Course[] = [
  { code: "CST-1212", name: "Programming Logic & Design (C++)", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Science", faculty: "FCS" },
  { code: "CST-1223", name: "Database Fundamentals", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-1234", name: "Digital and Logic Design", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CST-1241", name: "Discrete Mathematics", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computing", faculty: "FC" },
  { code: "P-1201", name: "College Physics", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Natural Science", faculty: "NS" },
];

const YEAR_2_SEM_1: Course[] = [
  { code: "CST-2112", name: "Data Structures and Algorithms", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Science", faculty: "FCS" },
  { code: "CST-2113", name: "Programming Language in Java", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Science", faculty: "FCS" },
  { code: "CST-2123", name: "Software Engineering", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-2126", name: "Database Management System", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-2135", name: "Computer Architecture & Organization", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CST-2141", name: "Linear Algebra", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computing", faculty: "FC" },
];

const YEAR_2_SEM_2: Course[] = [
  { code: "CST-2212", name: "Artificial Intelligence", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CST-2213", name: "Operating Systems", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CST-2224", name: "Software Analysis and Design", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-2235", name: "Data Communication and Networking", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-2234", name: "Digital System Design", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-2236", name: "Circuits and Electronics", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CST-2241", name: "Numerical Analysis and Differential Equations", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computing", faculty: "FC" },
];

const YEAR_3_SEM_1: Course[] = [
  { code: "CST-3112", name: "Professional Ethics", credits: 2, hasLab: false, labHours: 0, hoursPerWeek: 2, department: "Computer Science", faculty: "FCS" },
  { code: "CST-3113", name: "Analysis of Algorithms", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CS-3124", name: "Software Quality Assurance and Testing", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CS-3125", name: "Database System Structure", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-3136", name: "Computer Networks", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-3134", name: "Electronic Devices", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-3135", name: "Control Systems", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-3137", name: "Signals and Systems", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CST-3141", name: "Probability and Statistics", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computing", faculty: "FC" },
];

const YEAR_3_SEM_2: Course[] = [
  { code: "CS-3212", name: "Computer Vision", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Science", faculty: "FCS" },
  { code: "CS-3215", name: "Advanced Artificial Intelligence", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CST-3217", name: "Emerging Technologies", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CS-3223", name: "Software Design and Development", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Information Sciences", faculty: "FIS" },
  { code: "CST-3226", name: "Data Mining", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CT-3231", name: "Embedded and Microprocessor Systems", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-3232", name: "Computer and Network Security", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-3233", name: "Image Processing", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-3235", name: "Digital Signal Processing", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CS-3241", name: "Operations Research", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computing", faculty: "FC" },
];

const YEAR_4_SEM_1: Course[] = [
  { code: "CST-4112", name: "Parallel and Distributed Computing", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CS-4115", name: "Advanced Artificial Intelligence", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Science", faculty: "FCS" },
  { code: "CST-4123", name: "Software Project Management", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CS-4124", name: "Information Assurance and Security", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CT-4125", name: "Data Science", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CS-4126", name: "Data Science", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Information Sciences", faculty: "FIS" },
  { code: "CT-4131", name: "Cyber Security", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-4134", name: "Embedded Systems Integrating to IoT", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-4136", name: "Digital Forensics", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CT-4137", name: "Embedded Robotics", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computer Systems & Technologies", faculty: "FCST" },
  { code: "CST-4137", name: "Emerging Technologies II", credits: 3, hasLab: false, labHours: 0, hoursPerWeek: 3, department: "Computer Science", faculty: "FCS" },
  { code: "CST-4141", name: "Modeling and Simulation", credits: 4, hasLab: true, labHours: 2, hoursPerWeek: 4, department: "Computing", faculty: "FC" },
];

const YEAR_4_SEM_2: Course[] = [];

export const COURSES_BY_YEAR: CourseYearData[] = [
  {
    year: 1, label: "1st Year",
    semesters: [
      { semester: 1, courses: YEAR_1_SEM_1 },
      { semester: 2, courses: YEAR_1_SEM_2 },
    ],
  },
  {
    year: 2, label: "2nd Year",
    semesters: [
      { semester: 1, courses: YEAR_2_SEM_1 },
      { semester: 2, courses: YEAR_2_SEM_2 },
    ],
  },
  {
    year: 3, label: "3rd Year",
    semesters: [
      { semester: 1, courses: YEAR_3_SEM_1 },
      { semester: 2, courses: YEAR_3_SEM_2 },
    ],
  },
  {
    year: 4, label: "4th Year",
    semesters: [
      { semester: 1, courses: YEAR_4_SEM_1 },
      { semester: 2, courses: YEAR_4_SEM_2 },
    ],
  },
];

export const FACULTIES = [
  { id: "fcs", name: "Faculty of Computer Science", shortName: "FCS" },
  { id: "fcst", name: "Faculty of Computer Systems & Technologies", shortName: "FCST" },
  { id: "fis", name: "Faculty of Information Sciences", shortName: "FIS" },
  { id: "fc", name: "Faculty of Computing", shortName: "FC" },
  { id: "lang", name: "Department of Language", shortName: "LANG" },
  { id: "ns", name: "Department of Natural Science", shortName: "NS" },
  { id: "admin", name: "Department of Administration", shortName: "ADMIN" },
  { id: "finance", name: "Department of Finance", shortName: "FIN" },
  { id: "sa", name: "Department of Student Affairs", shortName: "SA" },
];

export function getAllCourses(year: number, semester: 1 | 2): Course[] {
  const yd = COURSES_BY_YEAR.find((c) => c.year === year);
  if (!yd) return [];
  const sem = yd.semesters.find((s) => s.semester === semester);
  return sem ? sem.courses : [];
}

export const SECTIONS = ["A", "B", "C"];

export function getYearLabel(year: number): string {
  const yd = COURSES_BY_YEAR.find((c) => c.year === year);
  return yd ? yd.label : "";
}
