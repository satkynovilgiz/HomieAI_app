
import { Unit } from './mathLessons';

export const CODING_UNITS: Unit[] = [
  {
    id: 'coding-intro', title: 'Coding Basics', emoji: '💻', color: '#10b981',
    description: 'Start your coding journey!',
    lessons: [
      {
        id: 'l9', title: 'What is Code?', emoji: '🤔', xp: 40,
        description: 'Understand what coding actually is',
        questions: [
          { id:'cq1', type:'multiple_choice', question:'What is a variable in programming?', options:['A math term','A container for data','A type of loop','A function'], answer:1, explanation:'Variables store data! Like a labeled box for your stuff.', xp:8 },
          { id:'cq2', type:'multiple_choice', question:'What does HTML stand for?', options:['HyperText Markup Language','High Text Machine Learning','HyperText Modern Language','None of these'], answer:0, explanation:'HyperText Markup Language — the skeleton of websites!', xp:8 },
          { id:'cq3', type:'true_false', question:'Python is a compiled language', options:['True','False'], answer:1, explanation:'Python is interpreted, not compiled! It runs line by line.', xp:8 },
          { id:'cq4', type:'multiple_choice', question:'Which of these is a valid Python variable name?', options:['2name','my-var','myVar','my var'], answer:2, explanation:'myVar is valid! No spaces, no starting with numbers, no hyphens.', xp:8 },
          { id:'cq5', type:'multiple_choice', question:'What is an algorithm?', options:['A type of computer','A step-by-step process','A programming language','A database'], answer:1, explanation:'An algorithm is a set of steps to solve a problem. Like a recipe!', xp:8 },
        ]
      },
      {
        id: 'l10', title: 'Python Basics', emoji: '🐍', xp: 60,
        description: 'Learn Python fundamentals',
        questions: [
          { id:'cq6', type:'multiple_choice', question:'How do you print "Hello" in Python?', options:['echo "Hello"','console.log("Hello")','print("Hello")','System.out.println("Hello")'], answer:2, explanation:'print("Hello") is the Python way! Simple and clean.', xp:12 },
          { id:'cq7', type:'multiple_choice', question:'What type is: x = 3.14', options:['int','float','string','bool'], answer:1, explanation:'3.14 is a float (decimal number) in Python!', xp:12 },
          { id:'cq8', type:'true_false', question:'In Python, lists use () brackets', options:['True','False'], answer:1, explanation:'Lists use [] square brackets! Tuples use ().', xp:12 },
          { id:'cq9', type:'multiple_choice', question:'What does len([1,2,3]) return?', options:['1','2','3','4'], answer:2, explanation:'len() returns the number of items — [1,2,3] has 3 items!', xp:12 },
        ]
      },
    ]
  },
];
