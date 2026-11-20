# RepoScope

Public GitHub portfolio explorer by **Rymbek Nazerke**.

**Product website / live demo:** https://nazek52.github.io/reposcope/

Enter a GitHub username to explore public repositories, primary languages, stars and missing descriptions. Search and sort projects, include or exclude forks, and export a JSON snapshot.

## GitHub REST API integration

- `GET https://api.github.com/users/{username}` loads the public profile.
- `GET https://api.github.com/users/{username}/repos?type=owner&sort=updated&per_page=100&page={page}` loads public repositories with pagination.
- Requests use the GitHub JSON media type and API version `2026-03-10`.
- Reads rate-limit response headers; handles missing accounts, HTTP failures and request timeouts.
- Public endpoints need no authentication, OAuth app, API key or repository permissions.

## Run and verify

Node.js 22+; no dependencies or installation needed.

```sh
npm start
# Open http://127.0.0.1:4173
npm test
npm run check
```

GitHub Pages: publish the main branch from the repository root. Runtime files are index.html, style.css, app.js and github.js.

## Privacy and boundaries

The browser connects directly to api.github.com. GitHub receives requested usernames and the visitor's IP address. No backend, analytics, cookies, permanent browser storage or tokens. A five-minute in-memory cache disappears when the page closes.

Unauthenticated requests normally have a budget of 60 per hour per originating IP, shared with other users on that network. A lookup uses one profile request plus repository pages. Pagination is capped at 1,000 repositories and the UI marks capped results as incomplete. Pages are not a transactional snapshot.

Original repositories are the default scope. Language totals count repositories by their reported primary language, not lines of code. Stars and missing descriptions are not assessments of code quality, authorship or professional skill. Archived projects are labelled. Private repositories, commit analysis and AI evaluation are not implemented.

JSON export includes the current original/all-repositories scope and summary; text search only filters the visible cards. Exports are saved only when requested. Dynamic API text is rendered with textContent.

## Support

Issues: https://github.com/nazek52/reposcope/issues

Independent, AI-assisted project. Not affiliated with or endorsed by GitHub. GitHub decides membership in its programs.

## References

- https://docs.github.com/en/rest/users/users#get-a-user
- https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
- https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api

MIT © 2026 Rymbek Nazerke
