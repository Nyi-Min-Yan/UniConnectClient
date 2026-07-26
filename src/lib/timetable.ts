import { type Course, getAllCourses } from "./courses";
import { getTeachersByCourse, getTeachersByFaculty, getFacultyIdFromCourse, type User } from "./users";

export type TimeSlot = {
  day: string;
  start: string;
  end: string;
};

export type TimetableEntry = {
  course: Course;
  section: string;
  year: number;
  semester: 1 | 2;
  type: "lecture" | "lab";
  slot: TimeSlot;
  room: string;
  teacherName: string;
  teacherId: number;
};

export type GeneratedTimetable = {
  year: number;
  semester: 1 | 2;
  section: string;
  entries: TimetableEntry[];
  teacherSlots: Map<number, Set<string>>;
  conflicts: { teacherName: string; courseCode: string; day: string; time: string; reason: string }[];
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const LECTURE_SLOTS: TimeSlot[] = [
  { day: "", start: "08:00", end: "09:00" },
  { day: "", start: "09:00", end: "10:00" },
  { day: "", start: "10:00", end: "11:00" },
  { day: "", start: "11:00", end: "12:00" },
  { day: "", start: "13:00", end: "14:00" },
  { day: "", start: "14:00", end: "15:00" },
  { day: "", start: "15:00", end: "16:00" },
];

const LAB_SLOTS: TimeSlot[] = [
  { day: "", start: "08:00", end: "10:00" },
  { day: "", start: "10:00", end: "12:00" },
  { day: "", start: "13:00", end: "15:00" },
  { day: "", start: "15:00", end: "17:00" },
];

const LAB_ROOMS = ["Lab A", "Lab B", "Lab C", "Lab D", "Lab E"];
const LECTURE_ROOMS = ["101", "102", "103", "104", "201", "202", "203", "301", "302"];

type SlotKey = string;

function slotKey(day: string, start: string, end: string): SlotKey {
  return `${day}|${start}|${end}`;
}

function resourceKey(slotDayStart: SlotKey, room: string): string {
  return `${slotDayStart}|${room}`;
}

export function generateTimetable(year: number, semester: 1 | 2): GeneratedTimetable[] {
  const courses = getAllCourses(year, semester);
  const sections = year <= 2 ? ["A", "B"] : ["A"];

  const results: GeneratedTimetable[] = [];

  for (const section of sections) {
    const occupiedSlots = new Set<string>();
    const occupiedResources = new Set<string>();
    const teacherSlots = new Map<number, Set<string>>();
    const conflicts: GeneratedTimetable["conflicts"] = [];
    let roomIndex = 0;
    let labRoomIndex = 0;

    const entries: TimetableEntry[] = [];

    const shuffled = [...courses].sort(() => Math.random() - 0.5);

    for (const course of shuffled) {
      const teachers = getTeachersByCourse(course.code);
      const lectureSlotsNeeded = course.hasLab ? Math.max(1, course.hoursPerWeek - 2) : course.hoursPerWeek;

      let placed = 0;
      let lectureAttempt = 0;

      while (placed < lectureSlotsNeeded && lectureAttempt < 80) {
        const dayIdx = Math.floor(Math.random() * DAYS.length);
        const slotIdx = Math.floor(Math.random() * LECTURE_SLOTS.length);
        const day = DAYS[dayIdx];
        const slot = LECTURE_SLOTS[slotIdx];
        const sk = slotKey(day, slot.start, slot.end);

        if (occupiedSlots.has(sk)) { lectureAttempt++; continue; }

        const room = LECTURE_ROOMS[roomIndex % LECTURE_ROOMS.length];
        const rk = resourceKey(sk, room);
        if (occupiedResources.has(rk)) { lectureAttempt++; continue; }

        const availableTeacher = teachers.find((t) => {
          const tSlots = teacherSlots.get(t.id);
          return !tSlots || !tSlots.has(sk);
        });

        if (availableTeacher) {
          occupiedSlots.add(sk);
          occupiedResources.add(rk);
          roomIndex++;
          if (!teacherSlots.has(availableTeacher.id)) teacherSlots.set(availableTeacher.id, new Set());
          teacherSlots.get(availableTeacher.id)!.add(sk);
          entries.push({
            course, section, year, semester, type: "lecture",
            slot: { day, start: slot.start, end: slot.end }, room: `Rm ${room}`,
            teacherName: availableTeacher.name, teacherId: availableTeacher.id,
          });
          placed++;
        } else {
          const freeTeacher = teachers.find((t) => {
            const tSlots = teacherSlots.get(t.id);
            return !tSlots || tSlots.size < 8;
          });
          if (freeTeacher) {
            occupiedSlots.add(sk);
            occupiedResources.add(rk);
            roomIndex++;
            if (!teacherSlots.has(freeTeacher.id)) teacherSlots.set(freeTeacher.id, new Set());
            teacherSlots.get(freeTeacher.id)!.add(sk);
            entries.push({
              course, section, year, semester, type: "lecture",
              slot: { day, start: slot.start, end: slot.end }, room: `Rm ${room}`,
              teacherName: freeTeacher.name, teacherId: freeTeacher.id,
            });
            placed++;
          } else {
            if (teachers.length > 0) {
              conflicts.push({
                teacherName: teachers[0].name,
                courseCode: course.code,
                day, time: `${slot.start}-${slot.end}`,
                reason: "Teacher overload — consider adding more lecturers",
              });
            }
            lectureAttempt++;
          }
        }
      }

      if (course.hasLab && course.labHours > 0) {
        const labSlotsNeeded = course.labHours >= 2 ? Math.ceil(course.labHours / 2) : 1;
        let labPlaced = 0;
        let labAttempt = 0;
        while (labPlaced < labSlotsNeeded && labAttempt < 40) {
          const dayIdx = Math.floor(Math.random() * DAYS.length);
          const slotIdx = Math.floor(Math.random() * LAB_SLOTS.length);
          const day = DAYS[dayIdx];
          const slot = LAB_SLOTS[slotIdx];
          const sk = slotKey(day, slot.start, slot.end);

          if (occupiedSlots.has(sk)) { labAttempt++; continue; }

          const room = LAB_ROOMS[labRoomIndex % LAB_ROOMS.length];
          const rk = resourceKey(sk, room);
          if (occupiedResources.has(rk)) { labAttempt++; continue; }

          const availableTeacher = teachers.find((t) => {
            const tSlots = teacherSlots.get(t.id);
            return !tSlots || !tSlots.has(sk);
          });

          if (availableTeacher) {
            occupiedSlots.add(sk);
            occupiedResources.add(rk);
            labRoomIndex++;
            if (!teacherSlots.has(availableTeacher.id)) teacherSlots.set(availableTeacher.id, new Set());
            teacherSlots.get(availableTeacher.id)!.add(sk);
            entries.push({
              course, section, year, semester, type: "lab",
              slot: { day, start: slot.start, end: slot.end }, room: `Lab ${room}`,
              teacherName: availableTeacher.name, teacherId: availableTeacher.id,
            });
            labPlaced++;
          } else {
            const freeTeacher = teachers.find((t) => {
              const tSlots = teacherSlots.get(t.id);
              return !tSlots || tSlots.size < 10;
            });
            if (freeTeacher) {
              occupiedSlots.add(sk);
              occupiedResources.add(rk);
              labRoomIndex++;
              if (!teacherSlots.has(freeTeacher.id)) teacherSlots.set(freeTeacher.id, new Set());
              teacherSlots.get(freeTeacher.id)!.add(sk);
              entries.push({
                course, section, year, semester, type: "lab",
                slot: { day, start: slot.start, end: slot.end }, room: `Lab ${room}`,
                teacherName: freeTeacher.name, teacherId: freeTeacher.id,
              });
              labPlaced++;
            } else {
              labAttempt++;
            }
          }
        }
      }
    }

    results.push({
      year, semester, section,
      entries: entries.sort((a, b) => {
        const dayOrder = DAYS.indexOf(a.slot.day) - DAYS.indexOf(b.slot.day);
        if (dayOrder !== 0) return dayOrder;
        return a.slot.start.localeCompare(b.slot.start);
      }),
      teacherSlots, conflicts,
    });
  }

  return results;
}

export function generateAll(year: number, semester: 1 | 2): GeneratedTimetable[] {
  return generateTimetable(year, semester);
}

export function getTeacherTimetable(
  timetable: GeneratedTimetable[],
  teacherId: number,
): { section: string; entries: TimetableEntry[] }[] {
  const result: { section: string; entries: TimetableEntry[] }[] = [];
  for (const t of timetable) {
    const filtered = t.entries.filter((e) => e.teacherId === teacherId);
    if (filtered.length > 0) result.push({ section: t.section, entries: filtered });
  }
  return result;
}
