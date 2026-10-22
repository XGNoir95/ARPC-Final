# Website previews and contextual files

All website previews share `AdminPreviewFrame`, `AdminPreviewStage` and `AdminPreviewToolbar`, including the homepage hero. Desktop uses a 1440px website viewport and fits the measured section into the stage. Mobile always renders a complete 390 by 844 phone viewport, at full scale whenever space permits and proportionally scaled only for a narrower dashboard. The phone height never shortens to fit the surrounding panel. Longer mobile pages scroll inside the phone, with a visible scroll hint below it. The outer stage reserves enough room for the whole phone and its hint, ranging from 544px to 928px high with the dashboard width; it keeps identical dimensions in Desktop and Mobile. Management cards follow in the shared responsive three-column grid.

The renderers use the public Hero, About, Featured, Sponsors, Catalogue, Enrollment, Gallery, Team and LearningCourse components. Public typography, image placement, responsive behavior and section structure come from those components rather than separate administrator approximations. Preview updates suppress automatic focus and scrolling in catalogue detail panels so writing in the editor remains uninterrupted. Navigation, enrollment submissions and learner progress mutations stay inactive inside previews.

Mobile preview surfaces fill the phone viewport even when a filter or collection is empty, so a shorter section never exposes a different page background underneath. Empty catalogue cards expand into the space below their heading and filters; resetting a filter restores the programmes without changing phone dimensions. Desktop previews continue measuring natural section height.

The standalone Media library is removed from navigation and workspace search. Its old `/admin/files` route redirects to Courses. Existing files and API routes remain intact:

- Every image field offers a device upload or an online HTTPS image link. Both update the same image and preview; a successful upload clears the link field. Existing uploaded images remain visible in the preview without filling the online-link field with a storage path.
- Courses contains a Course materials section with upload, search, download and deletion. Lesson editors continue to select private files and upload them directly while preparing reading.
- The API blocks deletion of files referenced by saved drafts, published content or lesson snapshots. The interface explains that the references must be removed first. Removing the tab does not delete any stored files or change learner access.
