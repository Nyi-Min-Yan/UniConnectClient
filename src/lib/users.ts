export type UserRole = "student" | "teacher" | "hod" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  faculty: string;
  facultyId: string;
  assignedCourses: string[];
  avatar: string;
};

export type TeacherAssignment = {
  teacherId: number;
  teacherName: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  department: string;
};

const TEACHERS: User[] = [
  { id: 101, name: "Dr. Aung Ko", email: "aung.ko@uni.edu", role: "hod", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CST-1102", "CST-3112"], avatar: "AK" },
  { id: 102, name: "Dr. Khin Mar Tun", email: "khinmar.tun@uni.edu", role: "teacher", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CST-2112", "CST-3113"], avatar: "KT" },
  { id: 103, name: "Dr. Soe Moe", email: "soe.moe@uni.edu", role: "teacher", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CST-2113", "CST-1212"], avatar: "SM" },
  { id: 104, name: "Dr. Hla Myint", email: "hla.myint@uni.edu", role: "teacher", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CST-4112", "CST-4137"], avatar: "HM" },
  { id: 105, name: "Dr. Thida Nwe", email: "thida.nwe@uni.edu", role: "teacher", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CS-4115", "CS-3215", "CS-3212"], avatar: "TN" },
  { id: 106, name: "Dr. Win Zaw", email: "win.zaw@uni.edu", role: "teacher", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CST-2212", "CST-2213"], avatar: "WZ" },
  { id: 107, name: "Daw Phyu Phyu", email: "phyu.phyu@uni.edu", role: "teacher", department: "Computer Science", faculty: "Faculty of Computer Science", facultyId: "fcs", assignedCourses: ["CST-3217"], avatar: "PP" },

  { id: 201, name: "Dr. Kyaw Thu", email: "kyaw.thu@uni.edu", role: "hod", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CST-2135", "CST-1234"], avatar: "KT" },
  { id: 202, name: "Dr. Mya Mya", email: "mya.mya@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CST-3136", "CST-2235"], avatar: "MM" },
  { id: 203, name: "Dr. Zaw Min", email: "zaw.min@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CT-3134", "CT-2234"], avatar: "ZM" },
  { id: 204, name: "Dr. Nilar", email: "nilar@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CT-3135", "CT-2236"], avatar: "NL" },
  { id: 205, name: "Dr. Than Tun", email: "than.tun@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CT-3137", "CT-3235"], avatar: "TT" },
  { id: 206, name: "Dr. Su Su", email: "su.su@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CT-4131", "CT-3232"], avatar: "SS" },
  { id: 207, name: "Dr. Aye Aye", email: "aye.aye@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CT-4134", "CT-3231"], avatar: "AA" },
  { id: 208, name: "Dr. Moe Moe", email: "moe.moe@uni.edu", role: "teacher", department: "Computer Systems & Technologies", faculty: "Faculty of Computer Systems & Technologies", facultyId: "fcst", assignedCourses: ["CT-4125", "CT-4136", "CT-4137", "CT-3233"], avatar: "MM" },

  { id: 301, name: "Dr. Tin Tin", email: "tin.tin@uni.edu", role: "hod", department: "Information Sciences", faculty: "Faculty of Information Sciences", facultyId: "fis", assignedCourses: ["CST-1123", "CST-1223"], avatar: "TT" },
  { id: 302, name: "Dr. Htay Htay", email: "htay.htay@uni.edu", role: "teacher", department: "Information Sciences", faculty: "Faculty of Information Sciences", facultyId: "fis", assignedCourses: ["CST-2123", "CST-2224"], avatar: "HH" },
  { id: 303, name: "Dr. Nu Nu", email: "nu.nu@uni.edu", role: "teacher", department: "Information Sciences", faculty: "Faculty of Information Sciences", facultyId: "fis", assignedCourses: ["CST-2126", "CS-3125"], avatar: "NN" },
  { id: 304, name: "Dr. Yu Yu", email: "yu.yu@uni.edu", role: "teacher", department: "Information Sciences", faculty: "Faculty of Information Sciences", facultyId: "fis", assignedCourses: ["CS-3124", "CS-4124"], avatar: "YY" },
  { id: 305, name: "Dr. Win Win", email: "win.win@uni.edu", role: "teacher", department: "Information Sciences", faculty: "Faculty of Information Sciences", facultyId: "fis", assignedCourses: ["CST-4123", "CST-3226"], avatar: "WW" },
  { id: 306, name: "Dr. Cherry", email: "cherry@uni.edu", role: "teacher", department: "Information Sciences", faculty: "Faculty of Information Sciences", facultyId: "fis", assignedCourses: ["CS-4126", "CS-3223"], avatar: "CH" },

  { id: 401, name: "Dr. Myint Myint", email: "myint.myint@uni.edu", role: "hod", department: "Computing", faculty: "Faculty of Computing", facultyId: "fc", assignedCourses: ["CST-1141", "CST-1241"], avatar: "MM" },
  { id: 402, name: "Dr. Sandar", email: "sandar@uni.edu", role: "teacher", department: "Computing", faculty: "Faculty of Computing", facultyId: "fc", assignedCourses: ["CST-2141", "CST-2241"], avatar: "SD" },
  { id: 403, name: "Dr. Thida", email: "thida@uni.edu", role: "teacher", department: "Computing", faculty: "Faculty of Computing", facultyId: "fc", assignedCourses: ["CST-3141", "CS-3241"], avatar: "TD" },
  { id: 404, name: "Dr. Phyu", email: "phyu@uni.edu", role: "teacher", department: "Computing", faculty: "Faculty of Computing", facultyId: "fc", assignedCourses: ["CST-4141"], avatar: "PH" },

  { id: 501, name: "Daw Hla Hla", email: "hla.hla@uni.edu", role: "hod", department: "Language", faculty: "Department of Language", facultyId: "lang", assignedCourses: ["ML-1101"], avatar: "HH" },
  { id: 502, name: "U Mya", email: "u.mya@uni.edu", role: "teacher", department: "Language", faculty: "Department of Language", facultyId: "lang", assignedCourses: ["EL-1101"], avatar: "UM" },

  { id: 601, name: "Dr. Tun Tun", email: "tun.tun@uni.edu", role: "hod", department: "Natural Science", faculty: "Department of Natural Science", facultyId: "ns", assignedCourses: ["P-1101", "P-1201"], avatar: "TT" },
  { id: 602, name: "Dr. Khin Khin", email: "khin.khin@uni.edu", role: "teacher", department: "Natural Science", faculty: "Department of Natural Science", facultyId: "ns", assignedCourses: ["P-1101", "P-1201"], avatar: "KK" },
];

export const ALL_USERS: User[] = TEACHERS;

export function getTeachersByFaculty(facultyId: string): User[] {
  return TEACHERS.filter((t) => t.facultyId === facultyId && (t.role === "teacher" || t.role === "hod"));
}

export function getTeachersByCourse(courseCode: string): User[] {
  return TEACHERS.filter((t) => t.assignedCourses.includes(courseCode));
}

export function getHODByFaculty(facultyId: string): User | undefined {
  return TEACHERS.find((t) => t.facultyId === facultyId && t.role === "hod");
}

export function getFacultyIdFromCourse(courseCode: string): string {
  if (courseCode.startsWith("CST-") || courseCode.startsWith("CS-")) {
    const year = parseInt(courseCode.match(/(\d)/)?.[1] || "1");
    if (year <= 2) return "fcs";
    if (courseCode.startsWith("CS-")) {
      if (["CS-3124", "CS-3125", "CS-4124", "CS-4126"].includes(courseCode)) return "fis";
      if (["CS-3212", "CS-3215", "CS-4115"].includes(courseCode)) return "fcs";
      if (["CS-3223"].includes(courseCode)) return "fis";
      if (["CS-3241"].includes(courseCode)) return "fc";
    }
    if (courseCode.startsWith("CT-") || ["CST-2135", "CST-2235", "CST-3136", "CST-1234"].includes(courseCode)) return "fcst";
    return "fcs";
  }
  if (courseCode.startsWith("CT-")) return "fcst";
  if (courseCode.startsWith("P-")) return "ns";
  if (courseCode.startsWith("ML-") || courseCode.startsWith("EL-")) return "lang";
  return "fc";
}

export function getAllFaculties() {
  return [
    { id: "fcs", name: "Faculty of Computer Science", shortName: "FCS" },
    { id: "fcst", name: "Faculty of Computer Systems & Technologies", shortName: "FCST" },
    { id: "fis", name: "Faculty of Information Sciences", shortName: "FIS" },
    { id: "fc", name: "Faculty of Computing", shortName: "FC" },
    { id: "lang", name: "Department of Language", shortName: "LANG" },
    { id: "ns", name: "Department of Natural Science", shortName: "NS" },
  ];
}
