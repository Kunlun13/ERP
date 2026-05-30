import { GRADES } from '../config/constants.js';

export const percentageToGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  if (percentage >= 33) return 'E';
  return 'F';
};

export const calculatePercentage = (obtained, max) => {
  if (!max || max === 0) return 0;
  return Math.round((obtained / max) * 100 * 100) / 100;
};

export const isPassing = (percentage, passMark = 33) => percentage >= passMark;

export const validateGrade = (grade) => GRADES.includes(grade?.toUpperCase?.() || grade);
