// ========================================
// MacBook 診断確認ツール
// ========================================

// ---------- 設定 ----------

// 優先表示する診断
const priorityDiagnostics = [
    "システム構成",
    "デバイスの復元",
    "修理後の診断"
];

// 「○○」の直後に表示したい診断
const afterRules = {
    "ディスプレイの異常": ["残像"]
};

let rules = {};

// チェック済み診断
let completedDiagnostics = new Set();

// ------------------------
// ルール読込
// ------------------------
async function loadRules() {

    const touchBar = document.getElementById("touchBar");
    const rulesPath = touchBar.checked
        ? "rules/touchbar.json"
        : "rules/standard.json";
    const selectedParts = getSelectedParts();
    const selectedDiagnostics = getSelectedDiagnostics();

    try {

        const response = await fetch(rulesPath);

        if (!response.ok) {
            throw new Error(`${response.status} ${response.statusText}`);
        }

        rules = await response.json();
        completedDiagnostics = selectedDiagnostics;

        createPartList(selectedParts);
        updateResult();

    } catch (error) {

        console.error(`${rulesPath} の読み込みに失敗しました`, error);

    }

}

function getSelectedParts() {

    const checkedParts =
        document.querySelectorAll("#partsContainer input:checked");

    return new Set([...checkedParts].map(part => part.value));

}

function getSelectedDiagnostics() {

    const checkedDiagnostics =
        document.querySelectorAll(".diagnostic-checkbox:checked");

    return new Set(
        [...checkedDiagnostics].map(diagnostic => diagnostic.dataset.name)
    );

}

// ------------------------
// パーツ一覧作成
// ------------------------
function createPartList(selectedParts = new Set()) {

    const container = document.getElementById("partsContainer");

    container.innerHTML = "";

    Object.keys(rules)
        .sort()
        .forEach(part => {

            container.innerHTML += `
                <div class="part-item">
                    <label>
                        <input
                            type="checkbox"
                            value="${part}"
                            ${selectedParts.has(part) ? "checked" : ""}
                            onchange="updateResult()">
                        ${part}
                    </label>
                </div>
            `;

        });

}

// ------------------------
// 診断表示
// ------------------------
function updateResult() {

    // 現在のチェック状態を保存
    completedDiagnostics.clear();

    document.querySelectorAll(".diagnostic-checkbox").forEach(box => {

        if (box.checked) {

            completedDiagnostics.add(box.dataset.name);

        }

    });

    const checkedParts =
    document.querySelectorAll("#partsContainer input:checked");

    // パーツ選択数を表示
    const partCount =
    document.getElementById("partCount");

    partCount.textContent =
    `選択数：${checkedParts.length}`;

    const diagnostics = new Set();

    checkedParts.forEach(item => {

        rules[item.value].forEach(diag => {

            diagnostics.add(diag);

        });

    });

    const result = document.getElementById("results");
    const count = document.getElementById("count");

    result.innerHTML = "";

    if (diagnostics.size === 0) {

        partCount.textContent = "選択数：0";

        result.innerHTML = "<p>パーツを選択してください。</p>";
        count.textContent = "診断数：0";

        return;

    }

    // 優先順位＋名前順
    const sortedDiagnostics = [...diagnostics].sort((a, b) => {

        const indexA = priorityDiagnostics.indexOf(a);
        const indexB = priorityDiagnostics.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return a.localeCompare(b, "ja");

    });

    // グループ表示
    const finalDiagnostics = [...sortedDiagnostics];

    Object.entries(afterRules).forEach(([parent, children]) => {

        const parentIndex = finalDiagnostics.indexOf(parent);

        if (parentIndex === -1) return;

        children.forEach(child => {

            const childIndex = finalDiagnostics.indexOf(child);

            if (childIndex !== -1) {

                finalDiagnostics.splice(childIndex, 1);

                const insertIndex = finalDiagnostics.indexOf(parent);

                finalDiagnostics.splice(insertIndex + 1, 0, child);

            }

        });

    });

    // 診断表示
    finalDiagnostics.forEach(diag => {

        result.innerHTML += `
            <div class="diagnostic-item">
                <label class="diagnostic-label">
                    <input
                        type="checkbox"
                        class="diagnostic-checkbox"
                        data-name="${diag}"
                        ${completedDiagnostics.has(diag) ? "checked" : ""}
                        onchange="updateProgress()">
                    <span>${diag}</span>
                </label>
            </div>
        `;

    });

    const hasTopCaseSelected = [...checkedParts].some(
        part => part.value === "上部ケース"
    );

    if (hasTopCaseSelected) {

        result.insertAdjacentHTML(
            "beforeend",
            `
                <p class="system-configuration-note">
                    MacBook Airモデルでは、上部ケースを交換した後にシステム構成を実行する必要はありません。
                </p>
            `
        );

    }

    const hasLogicBoardSelected = [...checkedParts].some(
        part => part.value === "ロジックボード"
    );

    if (hasLogicBoardSelected) {

        result.insertAdjacentHTML(
            "beforeend",
            `
                <p class="system-configuration-note">
                    ファームウェアをアップデートして最新のmacOSをインストールするため、「デバイスの復元」プログラムを実行してください。
                </p>
            `
        );

    }

    const hasDisplaySelected = [...checkedParts].some(
        part => part.value === "ディスプレイ"
    );

    if (hasDisplaySelected) {

        result.insertAdjacentHTML(
            "beforeend",
            `
                <p class="system-configuration-note">
                    MacBook Pro (14-inch, 2021および2023)のディスプレイを交換した場合、システム構成プログラムを実行する前に、映像の歪みや光の変化が生じることがあります。システム構成プログラムを完了した後、映像の歪みや光の変化が解消されているか確認してください。
                </p>
            `
        );

    }

    const hasAntennaSpeakerSelected = [...checkedParts].some(
        part => part.value === "アンテナ搭載スピーカー"
    );

    if (hasAntennaSpeakerSelected) {

        result.insertAdjacentHTML(
            "beforeend",
            `
                <p class="system-configuration-note">
                    システム構成は以下に対して必要<br>
                    ・MacBook Air (M2,2022)<br>
                    ・MacBook Air (13-inch, M3, 2024)<br>
                    ・MacBook Air (13-inch, M4, 2025)<br>
                    ・MacBook Air (13-inch, M5)
                </p>
            `
        );

    }

    const hasSpeakerSelected = [...checkedParts].some(
        part => part.value === "スピーカー"
    );

    if (hasSpeakerSelected) {

        result.insertAdjacentHTML(
            "beforeend",
            `
                <p class="system-configuration-note">
                    システム構成は以下に対して必要<br>
                    ・MacBook Air (15-inch, M2, 2023)<br>
                    ・MacBook Air (15-inch, M3, 2024)<br>
                    ・MacBook Air (15-inch, M4, 2025)<br>
                    ・MacBook Air (15-inch, M5)<br>
                    ・MacBook Pro (14-inch, 2021)<br>
                    ・MacBook Pro (14-inch, 2023)<br>
                    ・MacBook Pro (14-inch, Nov 2023)<br>
                    ・MacBook Pro (14-inch, 2024)<br>
                    ・MacBook Pro (14-inch. M5)<br>
                    ・MacBook Pro (14-inch, M5 Pro / M5 Max)<br>
                    ・MacBook Pro (16-inch, 2021)<br>
                    ・MacBook Pro (16-inch, 2023)<br>
                    ・MacBook Pro (16-inch, Nov 2023)<br>
                    ・MacBook Pro (16-inch, 2024)<br>
                    ・MacBook Pro (16-inch, M5 Pro/M5 Max)
                </p>
            `
        );

    }

    updateProgress();

}

// ------------------------
// 診断進捗更新
// ------------------------
function updateProgress() {

    const all =
        document.querySelectorAll(".diagnostic-checkbox");

    const checked =
        document.querySelectorAll(".diagnostic-checkbox:checked");

    const count =
        document.getElementById("count");

    // チェック済み診断を更新
    completedDiagnostics.clear();

    checked.forEach(box => {

        completedDiagnostics.add(box.dataset.name);

    });

    // 表示更新
    all.forEach(box => {

        const label = box.parentElement;

        if (box.checked) {

            label.classList.add("completed");

        } else {

            label.classList.remove("completed");

        }

    });

    // 進捗表示
    if (all.length > 0 && checked.length === all.length) {

        count.innerHTML =
            '<span class="complete-message">✅ すべての診断が完了しました</span>';

    } else {

        count.textContent =
            `診断数：${checked.length} / ${all.length} 完了`;

    }

}

// ------------------------
// 起動
// ------------------------
loadRules();
