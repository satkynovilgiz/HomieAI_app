
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LessonProgress {
  id: string; completed: boolean; stars: number;
  score: number; attempts: number; lastAttempt?: string;
}

export interface UnitProgress {
  unitId: string; unlocked: boolean; completed: boolean;
  lessons: LessonProgress[];
}

const initialUnits: UnitProgress[] = [
  { unitId:'math-basics', unlocked:true, completed:false, lessons:[
    { id:'l1', completed:true, stars:3, score:100, attempts:1 },
    { id:'l2', completed:true, stars:2, score:80, attempts:2 },
    { id:'l3', completed:false, stars:0, score:0, attempts:0 },
  ]},
  { unitId:'algebra', unlocked:false, completed:false, lessons:[
    { id:'l6', completed:false, stars:0, score:0, attempts:0 },
    { id:'l7', completed:false, stars:0, score:0, attempts:0 },
    { id:'l8', completed:false, stars:0, score:0, attempts:0 },
  ]},
  { unitId:'coding-intro', unlocked:true, completed:false, lessons:[
    { id:'l9', completed:true, stars:3, score:100, attempts:1 },
    { id:'l10', completed:false, stars:0, score:0, attempts:0 },
    { id:'l11', completed:false, stars:0, score:0, attempts:0 },
  ]},
  { unitId:'science-basics', unlocked:true, completed:false, lessons:[
    { id:'ls1', completed:false, stars:0, score:0, attempts:0 },
    { id:'ls2', completed:false, stars:0, score:0, attempts:0 },
  ]},
];

const UNIT_UNLOCKS: Record<string, string> = { 'math-basics': 'algebra' };

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState: { units: initialUnits, currentLesson: null as string | null, inSession: false, sessionXP: 0 },
  reducers: {
    startLesson(state, { payload }: PayloadAction<string>) { state.currentLesson = payload; state.inSession = true; state.sessionXP = 0; },
    completeLesson(state, { payload }: PayloadAction<{ lessonId: string; stars: number; score: number }>) {
      state.inSession = false;
      for (const unit of state.units) {
        const lesson = unit.lessons.find(l => l.id === payload.lessonId);
        if (lesson) {
          lesson.completed = true;
          lesson.stars = Math.max(lesson.stars, payload.stars);
          lesson.score = Math.max(lesson.score, payload.score);
          lesson.attempts++;
          lesson.lastAttempt = new Date().toISOString();
          if (unit.lessons.every(l => l.completed)) {
            unit.completed = true;
            const nextUnitId = UNIT_UNLOCKS[unit.unitId];
            const nextUnit = nextUnitId && state.units.find(u => u.unitId === nextUnitId);
            if (nextUnit) nextUnit.unlocked = true;
          }
          break;
        }
      }
    },
    addSessionXP(state, { payload }: PayloadAction<number>) { state.sessionXP += payload; },
    unlockUnit(state, { payload }: PayloadAction<string>) {
      const u = state.units.find(u => u.unitId === payload);
      if (u) u.unlocked = true;
    },
  },
});

export const { startLesson, completeLesson, addSessionXP: addLessonXP, unlockUnit } = lessonsSlice.actions;
export default lessonsSlice.reducer;
