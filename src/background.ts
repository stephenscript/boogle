// Function to add or update a query parameter in a URL
function addOrUpdateQueryParam(
  url: string,
  key: string,
  value: string,
): string {
  const urlObject = new URL(url)
  const params = new URLSearchParams(urlObject.search)

  // Set or update the query parameter
  params.set(key, value)

  // Update the search property of the URL object with the new query parameters
  urlObject.search = params.toString()

  // Return the updated URL
  return urlObject.toString()
}

function getIsGoogleSearch(url: string = '') {
  return url.startsWith('https://www.google.com/search?')
}

function setIconActive(isActive: boolean) {
  const iconPath = isActive
    ? '../icons/icon128.png'
    : '../icons/icon128-dull.png'

  chrome.action.setIcon({
    path: {
      '128': iconPath,
    },
  })
}

function onTabChange(url: string = '') {
  const isGoogleSearch = getIsGoogleSearch(url || '')
  setIconActive(isGoogleSearch)
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    onTabChange(tab.url)
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  onTabChange(tab.url)
})

// Listen for the onBeforeNavigate event
chrome.webNavigation.onCommitted.addListener((details) => {
  details.documentLifecycle
  const isGoogleSearch = getIsGoogleSearch(details.url)

  if (!isGoogleSearch) {
    // setIconActive(false);
    return
  }

  // setIconActive(true);
  // Append &udm=14 to all Google searches
  const updatedUrl = addOrUpdateQueryParam(details.url, 'udm', '14')

  // Redirect to the modified URL
  if (updatedUrl !== details.url) {
    chrome.tabs.update(details.tabId, { url: updatedUrl })
  }
})
