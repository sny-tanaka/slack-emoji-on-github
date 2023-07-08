let customEmoji;

const getCustomEmojiFromLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("slack_custom_emoji", function (value) {
            customEmoji = value.slack_custom_emoji;
            console.log("got custom emoji");
            resolve(true);
        });
    });
};

const replaceEmoji = () => {
    // <p dir="auto">のinnerTextが置換対象
    const elements = document.querySelectorAll('p[dir="auto"]');
    elements.forEach((element) => {
        const text = element.innerHTML;
        const replacedText = replaceEmojiText(text);
        element.innerHTML = replacedText;
    });
};

const replaceEmojiText = (text) => {
    let index = 0;
    const replaceTarget = [];
    while (true) {
        // 最初のコロン
        const firstColonIndex = text.indexOf(":", index);
        if (firstColonIndex === -1) {
            break;
        }
        // 次のコロン
        const secondColonIndex = text.indexOf(":", firstColonIndex + 1);
        if (secondColonIndex === -1) {
            break;
        }
        // コロンで挟まれた文字列を取得
        const emojiText = text.substring(firstColonIndex + 1, secondColonIndex);
        // 置換対象に追加
        replaceTarget.push(emojiText);

        index = secondColonIndex + 1;
    }
    for (const rt of replaceTarget) {
        // 絵文字のURLを取得
        const emojiUrl = customEmoji[rt];
        if (emojiUrl) {
            text = text.replace(`:${rt}:`, `<img src="${emojiUrl}" alt="${rt}" class="custom_emoji" />`);
        }
    }
    return text;
};

const main = async () => {
    await getCustomEmojiFromLocalStorage();
    replaceEmoji();
};

main();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    replaceEmoji();
    return true;
});
