# Boogle

Improves Google searches by removing distracting elements

## Changelog

### 1.1.5

- Added storage permission to better manage user preference state
- Using chrome storage, fixed a bug where the extension would switch to 'Enabled' after state was lost from window change or other causes
- Added functionality for udm=14 query param to be removed from tab on refresh if Boogle is not set to 'Enabled'

### 1.1.4

- Fixed a bug where icon indicator will dim when a new non-Google Search tab is opened and not currently focused

### 1.1.3

- Fixed a bug where UI would flash on some searches, particularly when searching from Google homepage

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
