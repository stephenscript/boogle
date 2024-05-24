# Boogle 1.1.0

Improves Google searches by removing distracting elements

## Changelog

### 1.1.0

- Removed AI element removal behavior from content script
- Instead, append &udm=14 to all Google search queries upon navigation to revert Google search to previous behavior
- Added tab context awareness to extension in order to indicate to user when Boogle is active by changing icon color
- Updated manifest for additional tab and webNavigation permissions
- Moved icons and added new -dull 128 size for browser icon toggle behavior

### 1.0.0

- Initial release. Remove AI element from Google search results