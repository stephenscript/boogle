# Boogle

Improves Google searches by removing distracting elements

## Changelog

### 1.1.2

- Updated description of app in package.json
- Resolved premature rerouting and subsequent UI flashing by removing use of onWebNavigation listener

### 1.1.1

- Updated extension behavior to only add &udm=14 param if no udm param is already present to prevent forceful redirects from images, etc.
- Improved consistency of icon activation graphic change and reduced risk of redirects when not intended
- Added toggle to enable or disable extension

### 1.1.0

- Removed AI element removal behavior from content script
- Instead, append &udm=14 to all Google search queries upon navigation to revert Google search to previous behavior
- Added tab context awareness to extension in order to indicate to user when Boogle is active by changing icon color
- Updated manifest for additional tab and webNavigation permissions
- Moved icons and added new -dull 128 size for browser icon toggle behavior

### 1.0.0

- Initial release. Remove AI element from Google search results
