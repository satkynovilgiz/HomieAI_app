
export interface Question {
  id: string; type: 'multiple_choice' | 'fill_blank' | 'true_false' | 'order';
  question: string; options?: string[]; answer: string | number;
  explanation: string; xp: number;
}

export interface Lesson {
  id: string; title: string; xp: number;
  description: string; questions: Question[];
}

export interface Unit {
  id: string; title: string; color: string;
  description: string; lessons: Lesson[];
}

export const MATH_UNITS: Unit[] = [
  {
    id: 'math-basics', title: 'Math Basics', color: '#7c3aed',
    description: 'Start with the fundamentals bro!',
    lessons: [
      {
        id: 'l1', title: 'Addition & Subtraction', xp: 50,
        description: 'Master the basics fr',
        questions: [
          { id:'q1', type:'multiple_choice', question:'What is 7 + 8?', options:['13','14','15','16'], answer:2, explanation:'7 + 8 = 15. Count up from 7 eight times!', xp:10 },
          { id:'q2', type:'multiple_choice', question:'What is 15 - 6?', options:['7','8','9','10'], answer:2, explanation:'15 - 6 = 9. Start at 15 and count back 6!', xp:10 },
          { id:'q3', type:'true_false', question:'12 + 13 = 26', options:['True','False'], answer:1, explanation:'12 + 13 = 25, not 26. Check your addition!', xp:10 },
          { id:'q4', type:'multiple_choice', question:'What is 100 - 37?', options:['53','63','73','83'], answer:1, explanation:'100 - 37 = 63. Borrow from the tens place!', xp:10 },
          { id:'q5', type:'multiple_choice', question:'What is 25 + 48?', options:['63','72','73','74'], answer:2, explanation:'25 + 48 = 73. Add the ones first: 5+8=13, carry the 1!', xp:10 },
        ]
      },
      {
        id: 'l2', title: 'Multiplication', xp: 60,
        description: 'Times tables got you? Not anymore!',
        questions: [
          { id:'q6', type:'multiple_choice', question:'What is 7 × 8?', options:['54','56','58','60'], answer:1, explanation:'7 × 8 = 56. This is one of the trickiest ones fr!', xp:12 },
          { id:'q7', type:'multiple_choice', question:'What is 12 × 12?', options:['124','134','144','154'], answer:2, explanation:'12 × 12 = 144. The famous "dozen dozen"!', xp:12 },
          { id:'q8', type:'true_false', question:'9 × 9 = 82', options:['True','False'], answer:1, explanation:'9 × 9 = 81, not 82. Close but no cap!', xp:12 },
          { id:'q9', type:'multiple_choice', question:'What is 6 × 7?', options:['36','40','42','48'], answer:2, explanation:'6 × 7 = 42. The answer to life, the universe... just kidding', xp:12 },
          { id:'q10', type:'multiple_choice', question:'What is 15 × 4?', options:['55','60','65','70'], answer:1, explanation:'15 × 4 = 60. Think 15+15=30, then ×2 = 60!', xp:12 },
        ]
      },
      {
        id: 'l3', title: 'Division', xp: 60,
        description: 'Split it up bro!',
        questions: [
          { id:'q11', type:'multiple_choice', question:'What is 48 ÷ 6?', options:['6','7','8','9'], answer:2, explanation:'48 ÷ 6 = 8. Think: 6 × ? = 48', xp:12 },
          { id:'q12', type:'multiple_choice', question:'What is 100 ÷ 4?', options:['20','25','30','35'], answer:1, explanation:'100 ÷ 4 = 25. Split 100 into 4 equal parts!', xp:12 },
          { id:'q13', type:'true_false', question:'72 ÷ 9 = 8', options:['True','False'], answer:0, explanation:'Yes! 72 ÷ 9 = 8. Because 9 × 8 = 72!', xp:12 },
          { id:'q14', type:'multiple_choice', question:'What is 81 ÷ 9?', options:['7','8','9','10'], answer:2, explanation:'81 ÷ 9 = 9. 9 is the square root of 81!', xp:12 },
          { id:'q15', type:'multiple_choice', question:'What is 144 ÷ 12?', options:['10','11','12','13'], answer:2, explanation:'144 ÷ 12 = 12. Remember 12×12=144 from before!', xp:12 },
        ]
      },
    ]
  },
  {
    id: 'algebra', title: 'Algebra', color: '#3b82f6',
    description: 'Variables and equations — not scary bro!',
    lessons: [
      {
        id: 'l6', title: 'Variables & Expressions', xp: 70,
        description: 'x marks the spot!',
        questions: [
          { id:'q21', type:'multiple_choice', question:'If x = 5, what is x + 3?', options:['6','7','8','9'], answer:2, explanation:'Just substitute: 5 + 3 = 8!', xp:14 },
          { id:'q22', type:'multiple_choice', question:'If y = 4, what is 2y?', options:['2','4','6','8'], answer:3, explanation:'2y means 2 × y = 2 × 4 = 8!', xp:14 },
          { id:'q23', type:'true_false', question:'If x = 3, then x² = 6', options:['True','False'], answer:1, explanation:'x² = x × x = 3 × 3 = 9, not 6!', xp:14 },
        ]
      },
    ]
  },
];
