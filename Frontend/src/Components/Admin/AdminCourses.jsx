import { useState } from 'react';
import AdminProgrammeSection from './AdminProgrammeSection';
import AdminLessons from './AdminLessons';
import AdminCourseMaterials from './AdminCourseMaterials';
import { adminFocus, adminPanel, adminQuiet, adminTypography } from './AdminUI.styles.js';

export default function AdminCourses({ entries, content, files, run, reloadFiles, busy, ...actions }) {
  const [courseId, setCourseId] = useState(null);
  const [lessonDirty, setLessonDirty] = useState(false);
  const courses = entries.filter(entry => entry.kind === 'courses');
  const selected = courses.find(course => course.id === courseId);
  const openLessons = course => {
    if (busy) return;
    if (courseId !== course.id && lessonDirty && !window.confirm('Discard the unsaved lesson changes and open another course?')) return;
    if (courseId !== course.id) setLessonDirty(false);
    setCourseId(course.id);
    requestAnimationFrame(() => document.getElementById('course-curriculum')?.scrollIntoView?.({ block: 'start' }));
  };
  return <div className="space-y-8">
    <nav aria-label="Course sections" className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/12 pb-4">{[['manage-courses', 'Courses'], ['course-curriculum', 'Lessons & materials'], ['course-materials', 'Course materials']].map(([id, label]) => <a key={id} href={`#${id}`} onClick={event => { event.preventDefault(); document.getElementById(id)?.scrollIntoView?.({ block: 'start' }); }} className={`inline-flex min-h-11 items-center rounded text-base font-semibold underline decoration-ink/20 underline-offset-8 hover:decoration-ink ${adminFocus}`}>{label}</a>)}</nav>
    <AdminProgrammeSection {...actions} kind="courses" entries={courses} content={content} busy={busy} onLessons={openLessons}/>
    <section id="course-curriculum" aria-labelledby="course-curriculum-heading" className="min-w-0 scroll-mt-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><h2 id="course-curriculum-heading" className={adminTypography.sectionTitle}>Lessons & materials</h2><p className="mt-2 text-base leading-7 text-muted">{selected ? selected.title : 'Choose a course card above to prepare its curriculum.'}</p></div>{selected && <a href="#manage-courses" className={adminQuiet} onClick={event => { event.preventDefault(); document.getElementById('manage-courses')?.scrollIntoView?.({ block: 'start' }); }}>Choose another course</a>}</header>
      {selected ? <AdminLessons key={selected.id} courses={[selected]} initialCourse={selected.id} embedded onDirtyChange={setLessonDirty} files={files} run={run} reloadFiles={reloadFiles} busy={busy}/> : <div className={`${adminPanel} p-5 sm:p-6`}><p className="text-base leading-7 text-muted">{courses.length ? 'Open Lessons & materials on a course card to arrange reading, videos and private files. Your course preview stays available above.' : 'Create a course first, then add the lessons and resources your learners will use.'}</p></div>}
    </section>
    <AdminCourseMaterials files={files} busy={busy} run={run} reloadFiles={reloadFiles}/>
  </div>;
}
