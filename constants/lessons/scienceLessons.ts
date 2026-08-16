
import { Unit } from './mathLessons';

export const SCIENCE_UNITS: Unit[] = [
  {
    id: 'science-basics', title: 'Science Basics', color: '#f97316',
    description: 'How the world actually works bro!',
    lessons: [
      {
        id: 'ls1', title: 'Chemistry Fundamentals', xp: 50,
        description: 'Atoms, molecules and reactions',
        questions: [
          { id:'sq1', type:'multiple_choice', question:'What is H₂O?', options:['Salt','Water','Sugar','Acid'], answer:1, explanation:'H₂O is water — 2 hydrogen atoms + 1 oxygen!', xp:10 },
          { id:'sq2', type:'multiple_choice', question:'How many elements are in the periodic table?', options:['100','108','118','128'], answer:2, explanation:'118 elements as of today! From Hydrogen to Oganesson.', xp:10 },
          { id:'sq3', type:'true_false', question:'Protons have a negative charge', options:['True','False'], answer:1, explanation:'Protons are POSITIVE! Electrons are negative, neutrons are neutral.', xp:10 },
          { id:'sq4', type:'multiple_choice', question:'What is the symbol for Gold?', options:['Go','Gd','Au','Ag'], answer:2, explanation:'Au comes from the Latin word "Aurum" meaning gold!', xp:10 },
          { id:'sq5', type:'multiple_choice', question:'What gas do plants absorb?', options:['Oxygen','Nitrogen','CO2','Hydrogen'], answer:2, explanation:'Plants absorb CO2 (carbon dioxide) and release oxygen during photosynthesis!', xp:10 },
        ]
      },
      {
        id: 'ls2', title: 'Physics Forces', xp: 60,
        description: 'Forces, motion and energy',
        questions: [
          { id:'sq6', type:'multiple_choice', question:'What is the speed of light?', options:['200,000 km/s','300,000 km/s','400,000 km/s','500,000 km/s'], answer:1, explanation:'~299,792 km/s — basically 300,000 km/s bro!', xp:12 },
{ id:'sq7', type:'multiple_choice', question:"What is Newton's 1st Law about?", options:['Force = mass × acceleration','Every action has reaction','Objects stay in motion unless acted upon','Energy conservation'], answer:2, explanation:"Inertia! Objects keep doing what they're doing unless a force acts on them.", xp:12 },       
{ id:'sq8', type:'true_false', question:'Gravity pulls objects toward each other', options:['True','False'], answer:0, explanation:"Yes! All objects with mass attract each other. That's gravity!", xp:12 }, ]
      },
    ]
  },
];
