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
        // 絵文字のURLを取得
        const emojiUrl = customEmoji[emojiText];
        if (emojiUrl) {
            // 絵文字のURLがある場合は画像に置換
            text = text.replace(`:${emojiText}:`, `<img src="${emojiUrl}" alt="${emojiText}" style="height:20px;vertical-align:sub;">`);
        }
        index = secondColonIndex + 1;
    };
    return text;
};

const main = async () => {
    await getCustomEmojiFromLocalStorage();
    replaceEmoji();
};

main();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    replaceEmoji();
});
