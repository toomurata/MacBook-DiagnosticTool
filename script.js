let rules = {};

async function loadRules(){

    const response =
        await fetch("rules.json");

    rules =
        await response.json();

    createPartList();

}

function createPartList(){

    const container =
        document.getElementById("partsContainer");

    Object.keys(rules).forEach(part=>{

        container.innerHTML+=`

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

function updateResult(){

    const checked=
        document.querySelectorAll(
            "#partsContainer input:checked"
        );

    let diagnostics=new Set();

    checked.forEach(item=>{

        rules[item.value].forEach(diag=>{

            diagnostics.add(diag);

        });

    });

    const result=
        document.getElementById("results");

    const count=
        document.getElementById("count");

    result.innerHTML="";

    [...diagnostics]
        .sort()
        .forEach(diag=>{

        result.innerHTML+=`
        <div class="diagnostic-item">

        ${diag}

        </div>
        `;

    });

    count.textContent=
        `診断数：${diagnostics.size}`;

}

loadRules();
