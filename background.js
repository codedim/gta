
// when the extension is installed or upgraded
chrome.runtime.onInstalled.addListener(function() {
	// replace all rules with a new rule
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([
			{
				// that fires when it's a Google Translate URL
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: { urlContains: '://translate.google.' },
					})
				],
				// and shows the extension's page action.
				actions: [ new chrome.declarativeContent.ShowPageAction() ]
			}
		]);
	});
});

