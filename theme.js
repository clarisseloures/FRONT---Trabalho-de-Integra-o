function lerTema() {
    try {
        return localStorage.getItem("donnuts-tema") === "escuro" ? "escuro" : "claro";
    } catch {
        return "claro";
    }
}

function aplicarTema(tema) {
    document.documentElement.dataset.tema = tema;
    const botao = document.querySelector(".alternar-tema");
    if (botao) {
        botao.textContent = tema === "escuro" ? "☀" : "☾";
        botao.title = tema === "escuro" ? "Ativar modo claro" : "Ativar modo escuro";
    }
}

aplicarTema(lerTema());
document.addEventListener("DOMContentLoaded", () => {
    aplicarTema(lerTema());
    document.querySelector(".alternar-tema").addEventListener("click", () => {
        const tema = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
        aplicarTema(tema);
        try { localStorage.setItem("donnuts-tema", tema); } catch {}
    });
});

window.addEventListener("storage", evento => {
    if (evento.key === "donnuts-tema") aplicarTema(lerTema());
});
