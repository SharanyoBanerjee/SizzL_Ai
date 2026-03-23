// API keys are now loaded from keys.js
const b1 = document.getElementById("btn-txt");
const b2 = document.getElementById("btn-img");
const b3 = document.getElementById("btn-theme");
const inp = document.getElementById("inp");
const chat = document.getElementById("chat");
const load = document.getElementById("load");

let msgs = [
    { role: "system", content: "You are SizzL, a helpful AI assistant. Always provide simple, and precise answers in one to two sentence. Do not generate long explanations unless explicitly asked to do so by the user." }
];
let isGenerating = false;

function addMsg(txt, cls) {
    const el = document.createElement("div");
    el.className = "msg " + cls;
    el.textContent = txt;
    chat.appendChild(el);
    chat.scrollTop = chat.scrollHeight;
    return el;
}

function show(s) {
    if (s) {
        load.style.display = "block";
    } else {
        load.style.display = "none";
    }
}

async function sendTxt() {
    if (isGenerating) return;
    const v = inp.value;
    if (v === "") return;
    isGenerating = true;
    addMsg(v, "usr");
    inp.value = "";
    show(true);

    msgs.push({ role: "user", content: v });

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + k1,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.2-1B-Instruct:novita",
                messages: msgs,
                temperature: 0.2,
                max_tokens: 500
            })
        });

        if (!res.ok) {
            const err = await res.text();
            addMsg("Error: " + res.status + " " + err, "err");
            show(false);
            isGenerating = false;
            return;
        }

        const data = await res.json();
        if (data && data.choices && data.choices.length > 0) {
            const txt = data.choices[0].message.content;
            msgs.push({ role: "assistant", content: txt });
            
            const box = addMsg("", "bot");
            let i = 0;
            const t = setInterval(function() {
                const isScrolledToBottom = chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 50;
                box.textContent += txt.charAt(i);
                if (isScrolledToBottom) {
                    chat.scrollTop = chat.scrollHeight;
                }
                i++;
                if (i >= txt.length) {
                    clearInterval(t);
                    isGenerating = false;
                }
            }, 30);
        } else {
            isGenerating = false;
        }
    } catch (e) {
        addMsg("Error: " + e.message, "err");
        isGenerating = false;
    }
    show(false);
}

async function sendImg() {
    if (isGenerating) return;
    const v = inp.value;
    if (v === "") return;
    isGenerating = true;
    addMsg(v, "usr");
    inp.value = "";
    
    const box = addMsg("Generating Image...", "bot");
    
    try {
        const res = await fetch("https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + k2,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: v })
        });

        if (!res.ok) {
            const err = await res.text();
            box.textContent = "Error: " + res.status + " " + err;
            box.className = "msg err";
            isGenerating = false;
            return;
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        box.textContent = "";
        const img = document.createElement("img");
        img.src = url;
        
        const isScrolledToBottom = chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 50;
        box.appendChild(img);
        if (isScrolledToBottom) {
            chat.scrollTop = chat.scrollHeight;
        }
        isGenerating = false;
    } catch (e) {
        box.textContent = "Error: " + e.message;
        box.className = "msg err";
        isGenerating = false;
    }
}

b1.addEventListener("click", sendTxt);
b2.addEventListener("click", sendImg);
b3.addEventListener("click", function() {
    const d = document.documentElement;
    if (d.getAttribute("data-theme") === "dark") {
        d.removeAttribute("data-theme");
    } else {
        d.setAttribute("data-theme", "dark");
    }
});

inp.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        sendTxt();
    }
});

window.onload = function() {
    isGenerating = true;
    const box = addMsg("", "bot");
    const txt = "Hello! I'm SizzLAI. How can I help you today?";
    let i = 0;
    const t = setInterval(function() {
        const isScrolledToBottom = chat.scrollHeight - chat.clientHeight <= chat.scrollTop + 50;
        box.textContent += txt.charAt(i);
        if (isScrolledToBottom) {
            chat.scrollTop = chat.scrollHeight;
        }
        i++;
        if (i >= txt.length) {
            clearInterval(t);
            msgs.push({ role: "assistant", content: txt });
            isGenerating = false;
        }
    }, 40);
};
