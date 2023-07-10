let customEmoji;

// localStorageにSlackのカスタム絵文字を保存する
const saveCustomEmoji = () => {
    // トークンを取得
    const token = document.getElementById('slack_token').value;
    // トークンがない場合は処理を終了
    if (!token) {
        showError('SlackのAPIトークンが設定されていません');
        return;
    }
    // Slackのカスタム絵文字を取得
    getCustomEmojiFromSlack(token).then((emoji) => {
        customEmoji = emoji;
        chrome.storage.local.set({ slack_custom_emoji: emoji });
        // 保存したことを通知
        showInfo('カスタム絵文字をブラウザに保存しました');
    });
};

const listUpCustomEmoji = () => {
    // 絵文字を表示する要素を取得
    const emojiResult = document.getElementById('emoji_result');
    // 絵文字を表示する要素を初期化
    emojiResult.innerHTML = '';
    // 検索ワードを取得
    const word = document.getElementById('search_word').value;
    // 検索ワードがない場合は処理を終了
    if (!word) {
        return;
    }
    // 絵文字を検索
    const searchedEmoji = searchCustomEmoji(word);
    // 絵文字を表示
    for (const key in searchedEmoji) {
        const img = document.createElement('img');
        img.src = searchedEmoji[key];
        img.title = key;
        img.onclick = () => copyToClipboard(key);
        emojiResult.appendChild(img);
    }
};

const searchCustomEmoji = (word) => {
    // wordに部分一致する絵文字を検索
    const searchedEmoji = {};
    for (const key in customEmoji) {
        if (key.includes(word)) {
            searchedEmoji[key] = customEmoji[key];
        }
    }
    return searchedEmoji;
};

const getCustomEmojiFromSlack = async (token) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            { type: 'fetchSlackEmoji', token: token },
            (response) => {
                if (!response.success) {
                    reject(response.error);
                }
                resolve(response.content);
            }
        );
    });
};

const getCustomEmojiFromLocalStorage = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get("slack_custom_emoji", function (value) {
            customEmoji = value.slack_custom_emoji;
            resolve(true);
        });
    });
}

const showInfo = (msg) => {
    const infoElement = document.getElementById('info');
    infoElement.innerText = msg;
    infoElement.animate(
        [
            { opacity: 0 },
            { opacity: 1 },
            { opacity: 1 },
            { opacity: 0 },
        ],
        {
            duration: 3500,
            fill: 'forwards',
        },
    )
}

const showError = (error) => {
    const errorElement = document.getElementById('error');
    errorElement.innerText = error;
}

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showInfo('クリップボードにコピーしました');
    });
};

document.getElementById('update').addEventListener('click', saveCustomEmoji);
document.getElementById('search_word').addEventListener('input', listUpCustomEmoji);
getCustomEmojiFromLocalStorage();
