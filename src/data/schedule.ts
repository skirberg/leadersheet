/* Lesson numbering, with no lesson content in it, so client code can use it without shipping every lesson to the browser. course.ts re-exports it. */

export const sheetNo = (n: number) => `Lesson ${n}`
