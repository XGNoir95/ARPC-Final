# Events, webinars and courses

The admin Content navigation keeps Programmes and Courses separate. Programmes contains Events first, then Webinars; Courses contains course listings and their curriculum. The former `/admin/learning` address redirects to `/admin/courses`.

Each collection follows the Homepage arrangement: a full-width desktop/mobile website preview, followed by a three-column management grid that becomes two or one columns in narrower containers. Preview mode does not change the width of the row. Previews use the actual catalogue or enrollment page, fit their contents without internal scrollbars, and retain only the theme control. Collections without entries show their own public empty state rather than inventing a draft.

Cards provide scoped search, publication filters, sorting, preview selection, enrollment availability and the same action order: Edit, Publish, Unpublish, Delete. Published unchanged entries cannot be published again; unpublished entries cannot be withdrawn. New drafts have their type fixed by the section where they were created. Events and Webinars never expose course-specific fields or cards.

Courses adds a Lessons & materials action to every course card. It opens that course's curriculum directly below the listing section. Reading, video links, ordering, publication and private resource uploads remain in this workspace. Reviewing another course preview preserves unfinished lesson writing; switching curricula asks before discarding it.

This is a reorganization of the admin workspace, with no copied records or database migration. All three types keep using the existing `programmes` content resource and revision checks. Courses are still eligible for Homepage Featured selection. Applications continue to be reviewed in Enrollments. Private file management lives under Courses; image editors offer device uploads or an online HTTPS image link.
