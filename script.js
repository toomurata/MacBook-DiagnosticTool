// ========================================
// MacBook 診断確認ツール
// ========================================

let rules = {};

// ------------------------
// ルール読込
// ------------------------
async function loadRules() {

    try {

        const response = await fetch("rules.json");

        rules = await response.json();

        createPartList();

    } catch (error) {

        console.error("rules.json の読み込みに失敗しました", error);

    }

}

// ------------------------
// パーツ一覧作成
// ------------------------
function createPartList() {

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

    const checkedParts = document.querySelectorAll(
        "#partsContainer input:checked"
    );

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

        result.innerHTML = `
            <p>パーツを選択してください。</p>
        `;

    } else {

        [...diagnostics]
            .sort()
            .forEach(diag => {

                result.innerHTML += `
                    <div class="diagnostic-item">
                        ${diag}
                    </div>
                `;

            });

    }

    count.textContent = `診断数：${diagnostics.size}`;

}

// ------------------------
// 起動
// ------------------------
loadRules();
