// src/utils/timetable.ts

import type {
  CourseResponse,
  TeachingAssignmentResponse,
  TimeSlotResponse,
  StaffResponse,
  ScheduleResponse,
  MeetingRequirementResponse
} from '@/types';

export type TimeSlot = {
  day: string;
  start: string;
  end: string;
  slotId?: string;
  periodNo?: number;
};

export type TimetableEntry = {
  course: CourseResponse;
  teachingAssignment?: TeachingAssignmentResponse;
  section: string;
  sectionId?: string;
  year: number;
  semester: number;
  type: 'LECTURE' | 'LAB' | 'LMS' | 'ASSIGNMENT' | 'BREAK';
  slot: TimeSlot;
  room?: string;
  teacherName?: string;
  teacherId?: string;
  scheduleId?: string;
};

export type GeneratedTimetable = {
  year: number;
  semester: number;
  section: string;
  sectionId?: string;
  entries: TimetableEntry[];
  teacherSlots: Map<string, Set<string>>;
  conflicts: { 
    teacherName: string; 
    courseCode: string; 
    day: string; 
    time: string; 
    reason: string;
    teacherId?: string;
  }[];
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function mapTimeSlotsToSlots(timeSlots: TimeSlotResponse[]): TimeSlot[] {
  return timeSlots.map(ts => ({
    day: '',
    start: ts.startTime,
    end: ts.endTime,
    slotId: ts.slotId,
    periodNo: ts.periodNo,
  }));
}

export function mapSchedulesToTimetableEntries(
  schedules: ScheduleResponse[],
  courses: CourseResponse[],
  teachingAssignments: TeachingAssignmentResponse[],
  staff: StaffResponse[],
  timeSlots: TimeSlotResponse[],
  year: number,
  semester: number,
  section: string,
  sectionId?: string
): TimetableEntry[] {
  const timeSlotMap = new Map(timeSlots.map(ts => [ts.slotId, ts]));
  const courseMap = new Map(courses.map(c => [c.courseId, c]));
  const staffMap = new Map(staff.map(s => [s.staffId, s]));
  const assignmentMap = new Map(teachingAssignments.map(ta => [ta.assignmentId, ta]));

  const entries: TimetableEntry[] = [];

  for (const schedule of schedules) {
    const startSlot = schedule.startSlotId
      ? timeSlotMap.get(schedule.startSlotId)
      : undefined;
    const endSlot = schedule.endSlotId
      ? timeSlotMap.get(schedule.endSlotId)
      : undefined;

    if (!startSlot || !endSlot) continue;

    if (schedule.scheduleType === 'COURSE') {
      if (!schedule.teachingAssignmentId) continue;

      const assignment = schedule.teachingAssignmentId
        ? assignmentMap.get(schedule.teachingAssignmentId)
        : undefined;
      const course = assignment?.courseId
        ? courseMap.get(assignment.courseId)
        : undefined;
      const teacher = assignment?.staffId
        ? staffMap.get(assignment.staffId)
        : undefined;

      if (!course) continue;

      // Determine if it's a lab or lecture based on course meeting requirements
      // If course has meetingRequirements property
      const isLab = (course as any).meetingRequirements?.some(
        (req: MeetingRequirementResponse) => req.meetingType === 'LAB'
      ) || false;

      entries.push({
        course,
        teachingAssignment: assignment,
        section,
        sectionId,
        year,
        semester,
        type: isLab ? 'LAB' : 'LECTURE',
        slot: {
          day: DAYS[schedule.dayOfWeek - 1] || 'Monday',
          start: startSlot.startTime,
          end: endSlot.endTime,
          slotId: schedule.startSlotId,
          periodNo: startSlot.periodNo,
        },
        room: (schedule as any).room || `Room ${Math.floor(Math.random() * 10) + 1}`,
        teacherName: teacher?.staffName || 'Unknown',
        teacherId: teacher?.staffId,
        scheduleId: schedule.scheduleId,
      });
      continue;
    }

    // LMS / ASSIGNMENT / BREAK: timetable activities without a teaching assignment.
    const typeName = schedule.scheduleType;
    const label =
      typeName === 'LMS' ? 'LMS Activity'
      : typeName === 'ASSIGNMENT' ? 'Assignment'
      : 'Break';
    entries.push({
      course: {
        courseId: schedule.scheduleId,
        unitId: schedule.generationId,
        unitCode: '',
        courseCode: schedule.courseCode || typeName,
        courseName: label,
        creditUnit: 0,
        majorId: null,
        majorCode: null,
        semesterId: null,
        semesterNo: null,
        isRequired: false,
        displayOrder: 0,
      },
      teachingAssignment: undefined,
      section,
      sectionId,
      year,
      semester,
      type: typeName as 'LMS' | 'ASSIGNMENT' | 'BREAK',
      slot: {
        day: DAYS[schedule.dayOfWeek - 1] || 'Monday',
        start: startSlot.startTime,
        end: endSlot.endTime,
        slotId: schedule.startSlotId,
        periodNo: startSlot.periodNo,
      },
      room: (schedule as any).room || '',
      teacherName: schedule.staffName || undefined,
      teacherId: undefined,
      scheduleId: schedule.scheduleId,
    });
  }

  return entries;
}

export function generateAllFromAPI(
  schedules: ScheduleResponse[],
  courses: CourseResponse[],
  teachingAssignments: TeachingAssignmentResponse[],
  staff: StaffResponse[],
  timeSlots: TimeSlotResponse[],
  year: number,
  semester: number,
  sections: { id: string; name: string }[]
): GeneratedTimetable[] {
  const result: GeneratedTimetable[] = [];

  for (const section of sections) {
    const entries = mapSchedulesToTimetableEntries(
      schedules,
      courses,
      teachingAssignments,
      staff,
      timeSlots,
      year,
      semester,
      section.name,
      section.id
    );

    const conflicts = detectConflicts(entries);
    const teacherSlots = buildTeacherSlots(entries);

    result.push({
      year,
      semester,
      section: section.name,
      sectionId: section.id,
      entries,
      teacherSlots,
      conflicts,
    });
  }

  return result;
}

export function detectConflicts(
  entries: TimetableEntry[]
): { teacherName: string; courseCode: string; day: string; time: string; reason: string; teacherId?: string }[] {
  const conflicts: { teacherName: string; courseCode: string; day: string; time: string; reason: string; teacherId?: string }[] = [];
  const teacherSchedule = new Map<string, Map<string, Set<string>>>();

  for (const entry of entries) {
    if (!entry.teacherId) continue;

    const day = entry.slot.day;
    const time = `${entry.slot.start}-${entry.slot.end}`;
    const key = `${entry.teacherId}-${day}-${time}`;

    if (!teacherSchedule.has(entry.teacherId)) {
      teacherSchedule.set(entry.teacherId, new Map());
    }

    const teacherMap = teacherSchedule.get(entry.teacherId)!;
    if (!teacherMap.has(day)) {
      teacherMap.set(day, new Set());
    }

    const daySet = teacherMap.get(day)!;
    if (daySet.has(time)) {
      conflicts.push({
        teacherName: entry.teacherName || 'Unknown',
        courseCode: (entry.course as any).code || entry.course.courseId,
        day,
        time,
        reason: 'Teacher has overlapping schedule',
        teacherId: entry.teacherId,
      });
    } else {
      daySet.add(time);
    }
  }

  return conflicts;
}

export function buildTeacherSlots(
  entries: TimetableEntry[]
): Map<string, Set<string>> {
  const slots = new Map<string, Set<string>>();
  
  for (const entry of entries) {
    if (!entry.teacherId) continue;
    const key = `${entry.teacherId}-${entry.slot.day}-${entry.slot.start}`;
    if (!slots.has(key)) {
      slots.set(key, new Set());
    }
    slots.get(key)!.add((entry.course as any).code || entry.course.courseId);
  }

  return slots;
}

export function sortTimetableEntries(entries: TimetableEntry[]): TimetableEntry[] {
  return [...entries].sort((a, b) => {
    const dayOrder = DAYS.indexOf(a.slot.day) - DAYS.indexOf(b.slot.day);
    if (dayOrder !== 0) return dayOrder;
    return a.slot.start.localeCompare(b.slot.start);
  });
}

export function getTeacherTimetable(
  timetable: GeneratedTimetable[],
  teacherId: string
): { section: string; sectionId?: string; entries: TimetableEntry[] }[] {
  const result: { section: string; sectionId?: string; entries: TimetableEntry[] }[] = [];
  
  for (const t of timetable) {
    const filtered = t.entries.filter(e => e.teacherId === teacherId);
    if (filtered.length > 0) {
      result.push({ 
        section: t.section, 
        sectionId: t.sectionId, 
        entries: sortTimetableEntries(filtered) 
      });
    }
  }
  
  return result;
}

export function getSectionTimetable(
  timetable: GeneratedTimetable[],
  sectionIdOrName: string
): GeneratedTimetable | undefined {
  return timetable.find(t => t.sectionId === sectionIdOrName || t.section === sectionIdOrName);
}

export function getCourseTimetable(
  timetable: GeneratedTimetable[],
  courseId: string
): TimetableEntry[] {
  const entries: TimetableEntry[] = [];
  for (const t of timetable) {
    for (const entry of t.entries) {
      if (entry.course.courseId === courseId) {
        entries.push(entry);
      }
    }
  }
  return sortTimetableEntries(entries);
}

export function getFacultyTimetable(
  timetable: GeneratedTimetable[],
  facultyId: string,
  staff: StaffResponse[]
): TimetableEntry[] {
  const facultyStaffIds = new Set(
    staff.filter(s => s.unitId === facultyId).map(s => s.staffId)
  );
  
  const entries: TimetableEntry[] = [];
  for (const t of timetable) {
    for (const entry of t.entries) {
      if (entry.teacherId && facultyStaffIds.has(entry.teacherId)) {
        entries.push(entry);
      }
    }
  }
  return sortTimetableEntries(entries);
}

export function getDayLabel(dayIndex: number): string {
  return DAYS[dayIndex - 1] || 'Monday';
}

export function getDayShortLabel(dayIndex: number): string {
  return DAYS_SHORT[dayIndex - 1] || 'Mon';
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

export function getTotalHours(entries: TimetableEntry[]): number {
  return entries.reduce((total, entry) => {
    const startHour = parseInt(entry.slot.start.split(':')[0]);
    const endHour = parseInt(entry.slot.end.split(':')[0]);
    return total + (endHour - startHour);
  }, 0);
}

export function getCourseStats(entries: TimetableEntry[]) {
  const lectures = entries.filter(e => e.type === 'LECTURE').length;
  const labs = entries.filter(e => e.type === 'LAB').length;
  const uniqueCourses = new Set(entries.map(e => e.course.courseId)).size;
  const uniqueTeachers = new Set(entries.map(e => e.teacherId).filter(Boolean)).size;
  const totalHours = getTotalHours(entries);

  return { lectures, labs, uniqueCourses, uniqueTeachers, totalHours };
}