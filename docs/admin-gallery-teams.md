# Gallery and Panel teams

Both tabs use a persistent website preview in the first full-width row. Desktop renders the real public section at its desktop breakpoint; Mobile keeps the row width and centres the phone-sized viewport. Preview content grows to fit without internal scrollbar tracks. The three-column card grid below changes to two or one columns only when the dashboard container becomes narrower.

Gallery cards keep image frames, category and artwork labels, two-line titles, captions and actions aligned. Posters use contain sizing so artwork is not cropped. Search, category, publication filters and sorting operate together. Panel team cards show member counts, names, roles or departments, and the first three roster entries. The full roster remains available in the website preview and editor; team search includes every member, including those outside the card summary.

Selecting a card reviews its draft without opening a second preview dialog. Only the selected unpublished record is added to the published preview collection. Every card uses Edit, Publish, Unpublish and Delete in the same order. Unchanged published entries disable Publish; unpublished entries disable Unpublish. Narrow cards retain the complete action row with accessible icon labels.

The draft editor previews the record being edited and keeps its fields beneath it. It does not add another neighbouring-card chooser that could make preview selection diverge from the record being saved. Existing gallery image uploads, captions, categories and artwork flags, along with team introductions, member names, roles, departments and portraits, keep their existing save and revision workflow.

Each member also has LinkedIn and GitHub profile fields. Admins can enter a handle or an HTTPS profile address. The API retains these fields and normalizes them to the official profile hosts before publication. The same public member profile component renders the links in the website and the preview. Empty profiles retain their unavailable state; invalid or third-party URLs cannot become clickable social links.
