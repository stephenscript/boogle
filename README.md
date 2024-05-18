# Clear Glass

## The problem

- Glassdoor.com and other similar websites now enforce users to both log in and to contribute with posts or ratings in order to access reviews and other content

## The solution

- The Clear Glass extension removes aggressive tactics to obstruct use of the site
  
## Websites included in this extension

- Glassdoor.com
- Teamblind.com
- Repvue.com

## How it works

- Glassdoor.com and other similar websites block access on the client-side, but does not prevent data from being downloaded from their server when a user has not met the criteria to access content. Because of this design, client-side changes done within this extension can bypass these restrictions.

## Limitations

- The nature of this extension being a Chrome extension content script, there is a small delay before access blockers are removed
- There are some components that require data from the server that is not provided to users who are not logged in. Logging in will be required to access all content.
- If Glassdoor.com or other websites included in this extension update their user validation in such a way that restricts user access through server-side limitations, this extension will no longer function.
