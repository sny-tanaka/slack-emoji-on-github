chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "fetchSlackEmoji") {
        console.log('Fetch slack emoji');
        getCustomEmojiFromSlack(request.token)
            .then((emoji) => {
                sendResponse({ success: true, content: emoji });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
    }
    return true;
});

const getCustomEmojiFromSlack = async (token) => {
    const response = await fetch('https://slack.com/api/emoji.list', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const json = await response.json();
    if (!json.ok) {
        console.error('Slackのカスタム絵文字の取得に失敗しました');
        return;
    }
    return json.emoji;
};

// ページの読み込みの発生しないページの更新をキャッチする
chrome.webRequest.onCompleted.addListener((details) => {
    console.log('onCompleted');
    chrome.tabs.query({
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, (result) => {
        const currentTab = result.shift();
        chrome.tabs.sendMessage(currentTab.id, details, () => {});
    });
}, { urls: ["<all_urls>"] }, ["responseHeaders"]);
