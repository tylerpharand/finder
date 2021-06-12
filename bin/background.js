function reddenPage(){document.body.style.backgroundColor="red"}chrome.action.onClicked.addListener((e=>{chrome.scripting.executeScript({target:{tabId:e.id},function:reddenPage})}));
