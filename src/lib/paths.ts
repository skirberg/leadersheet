/*
  A lesson's address comes from its title: /learn/power-and-influence/. The ids (s1 to s24) are the keys progress is
  stored under, so they never change, but they stopped matching the lesson numbers when s12 moved to the end of the
  course: lesson 12 lived at /learn/s13/. A title reads right in a link and survives any reordering. The old /learn/sN/
  addresses redirect permanently (vercel.json), and smoke checks that every lesson has one. Renaming a lesson changes
  its address, so give the old one a redirect too.
*/
export const lessonSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export const lessonHref = (s: { title: string }) => `/learn/${lessonSlug(s.title)}/`
