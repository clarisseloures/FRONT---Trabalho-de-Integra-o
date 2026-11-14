const produtos = [
  {
    "id": "original",
    "name": "Original",
    "image": "images/2006-11-imgImage3.png",
    "cartImage": "images/2007-2-imgImage4.png"
  },
  {
    "id": "chocolate",
    "name": "Chocolate",
    "image": "images/2006-11-imgImage2.png",
    "cartImage": "images/2007-2-imgImage5.png"
  },
  {
    "id": "amendoim",
    "name": "Amendoim C/ Nutella",
    "image": "images/2006-11-imgImageRemovebgPreview1.png"
  },
  {
    "id": "morango",
    "name": "Morango c/Confeitos",
    "image": "images/2006-11-imgImageRemovebgPreview21.png"
  }
];
const iconeMais = "images/2007-2-imgCirclePlusSolidFull11.svg";
const iconeLixeira = "images/2007-2-imgTrashCanSolidFull1.svg";
const busca = document.getElementById("busca");
if (busca) {
    const campoBusca = document.getElementById("buscar-sabor");
    const resultadoBusca = document.getElementById("resultado-busca");
    const normalizar = texto => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    function filtrarProdutos() {
        const termos = normalizar(campoBusca.value.trim()).split(/\s+/).filter(Boolean);
        let encontrados = 0;
        document.querySelectorAll(".produto").forEach(item => {
            const nome = normalizar(item.querySelector("h3").textContent);
            item.hidden = !termos.every(termo => nome.includes(termo));
            if (!item.hidden) encontrados++;
        });
        resultadoBusca.textContent = termos.length === 0 ? "" :
            encontrados === 0 ? "Nenhum sabor encontrado. Tente outro nome." :
            encontrados + (encontrados === 1 ? " sabor encontrado." : " sabores encontrados.");
    }

    campoBusca.value = new URLSearchParams(location.search).get("q") || "";
    campoBusca.addEventListener("input", filtrarProdutos);
    busca.addEventListener("submit", evento => {
        evento.preventDefault();
        filtrarProdutos();
    });
    filtrarProdutos();
    if (location.hash === "#busca") campoBusca.focus();
}
document.querySelectorAll(".menu").forEach(menu => {
    const resumo = menu.querySelector("summary");
    const painel = menu.querySelector("nav");
    let aberto = menu.open;
    let animacao;

    function alternarMenu(abrir) {
        aberto = abrir;
        const estavaFechado = !menu.open;
        menu.open = true;
        const estilo = getComputedStyle(painel);
        const inicio = {
            opacity: estavaFechado ? 0 : estilo.opacity,
            transform: estavaFechado ? "translateY(-8px) scale(0.96)" : estilo.transform
        };
        if (animacao) animacao.cancel();
        painel.inert = !abrir;
        resumo.title = abrir ? "Fechar menu" : "Abrir menu";
        animacao = painel.animate([
            inicio,
            { opacity: abrir ? 1 : 0, transform: abrir ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.96)" }
        ], {
            duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 250,
            easing: "ease-out",
            fill: "forwards"
        });
        animacao.onfinish = () => {
            menu.open = abrir;
            animacao.cancel();
            animacao = null;
        };
    }

    resumo.addEventListener("click", evento => {
        evento.preventDefault();
        alternarMenu(!aberto);
    });
    document.addEventListener("click", evento => {
        if (aberto && !menu.contains(evento.target)) alternarMenu(false);
    });
    menu.addEventListener("keydown", evento => {
        if (evento.key === "Escape") {
            alternarMenu(false);
            resumo.focus();
        }
    });
});
function ler(chave, padrao) {
    try { return JSON.parse(localStorage.getItem(chave)) ?? padrao; } catch { return padrao; }
}
function guardar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { aviso("O navegador não permitiu salvar os dados."); }
}
function aviso(texto) {
    const elemento = document.getElementById("aviso");
    if (elemento) elemento.textContent = texto;
}
let carrinho = ler("donnuts-carrinho", { original: 1, chocolate: 1 });
const perfil = ler("donnuts-perfil", {});
function estaLogado() {
    return sessionStorage.getItem("donnuts-logado") === "true";
}
function entrar() {
    sessionStorage.setItem("donnuts-logado", "true");
    const voltarAoCarrinho = sessionStorage.getItem("donnuts-voltar-carrinho") === "true";
    sessionStorage.removeItem("donnuts-voltar-carrinho");
    location.href = voltarAoCarrinho ? "carrinho.html" : "cardapio.html";
}
document.querySelectorAll(".conta").forEach(link => {
    if (estaLogado()) {
        link.href = "perfil.html";
        const icone = document.createElement("img");
        icone.src = "images/2007-2-imgUserRegularFull1.svg";
        icone.alt = "Meu perfil";
        link.replaceChildren(icone);
    } else {
        link.href = "login.html";
        link.textContent = "Login";
    }
});
if (!estaLogado() && (document.getElementById("pedido") || document.getElementById("perfil"))) {
    location.replace("cadastro.html");
}
const dinheiro = valor => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
function total() {
    return produtos.reduce((soma, produto) => soma + (carrinho[produto.id] || 0) * 12, 0);
}
function renderizarCarrinho() {
    const lista = document.getElementById("itens-carrinho");
    if (!lista) return;
    lista.replaceChildren();
    produtos.forEach(produto => {
        const quantidade = carrinho[produto.id] || 0;
        if (!quantidade) return;
        const item = document.createElement("article");
        item.className = "item";
        item.innerHTML = '<img src="' + (produto.cartImage || produto.image) + '" alt="Donut ' + produto.name + '">' +
            '<h3>' + produto.name + '</h3>' +
            '<p>' + dinheiro(12 * quantidade) + '</p>' +
            '<button class="remover" title="Remover produto"><img src="' + iconeLixeira + '" alt="Remover"></button>' +
            '<div class="controle-quantidade">' +
                '<button class="diminuir" title="Diminuir quantidade"' + (quantidade === 1 ? ' disabled' : '') + '>−</button>' +
                '<span class="quantidade">' + quantidade + '</span>' +
                '<button class="aumentar" title="Aumentar quantidade"><img src="' + iconeMais + '" alt="Aumentar"></button>' +
            '</div>';
        item.querySelector(".remover").onclick = () => { delete carrinho[produto.id]; atualizarCarrinho(); };
        item.querySelector(".diminuir").onclick = () => {
            if (carrinho[produto.id] > 1) {
                carrinho[produto.id]--;
                atualizarCarrinho();
            }
        };
        item.querySelector(".aumentar").onclick = () => { carrinho[produto.id]++; atualizarCarrinho(); };
        lista.append(item);
    });
    if (!total()) lista.textContent = "Seu carrinho está vazio. Escolha um produto no cardápio.";
    document.getElementById("total").textContent = "Valor Total: " + dinheiro(total());
    document.querySelector(".endereco-pedido").textContent = perfil.endereco || "*Endereço*";
    document.getElementById("pagamento").disabled = !total();
}
function atualizarCarrinho() { guardar("donnuts-carrinho", carrinho); renderizarCarrinho(); }
document.querySelectorAll("[data-adicionar]").forEach(botao => {
    botao.onclick = () => {
        const id = botao.dataset.adicionar;
        carrinho[id] = (carrinho[id] || 0) + 1;
        guardar("donnuts-carrinho", carrinho);
        aviso(produtos.find(produto => produto.id === id).name + " adicionado ao carrinho.");
    };
});
renderizarCarrinho();

function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (!numeros) return "";
    if (numeros.length <= 2) return "(" + numeros;
    const ddd = numeros.slice(0, 2);
    const numero = numeros.slice(2);
    const corte = numeros.length === 11 ? 5 : 4;
    return "(" + ddd + ") " + numero.slice(0, corte) +
        (numero.length > corte ? "-" + numero.slice(corte) : "");
}

["form-cadastro", "form-perfil"].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;
    ["email", "telefone", "endereco"].forEach(nome => { form.elements[nome].value = perfil[nome] || ""; });
    const telefone = form.elements.telefone;
    telefone.value = formatarTelefone(telefone.value);
    telefone.addEventListener("input", () => {
        const posicao = telefone.selectionStart;
        const digitosAntes = telefone.value.slice(0, posicao).replace(/\D/g, "").length;
        telefone.value = formatarTelefone(telefone.value);
        let cursor = 0;
        let contagem = 0;
        while (cursor < telefone.value.length && contagem < digitosAntes) {
            if (/\d/.test(telefone.value[cursor])) contagem++;
            cursor++;
        }
        telefone.setSelectionRange(cursor, cursor);
    });
    telefone.addEventListener("paste", evento => {
        evento.preventDefault();
        const numeros = evento.clipboardData.getData("text").replace(/\D/g, "");
        const inicio = telefone.selectionStart;
        const fim = telefone.selectionEnd;
        telefone.value = telefone.value.slice(0, inicio) + numeros + telefone.value.slice(fim);
        telefone.setSelectionRange(inicio + numeros.length, inicio + numeros.length);
        telefone.dispatchEvent(new Event("input"));
    });
    telefone.addEventListener("beforeinput", evento => {
        const cursor = telefone.selectionStart;
        if (evento.inputType === "deleteContentBackward" && cursor === telefone.selectionEnd &&
            cursor > 0 && /\D/.test(telefone.value[cursor - 1])) {
            evento.preventDefault();
            let inicio = cursor - 1;
            while (inicio > 0 && /\D/.test(telefone.value[inicio])) inicio--;
            telefone.setRangeText("", inicio, cursor, "end");
            telefone.dispatchEvent(new Event("input"));
        }
    });
    const endereco = form.elements.endereco;
    function validarEndereco() {
        const texto = endereco.value.trim();
        endereco.setCustomValidity(endereco.value && texto.length < 3 ?
            "Informe um endereço com pelo menos 3 caracteres." : "");
    }
    endereco.addEventListener("input", validarEndereco);
    endereco.addEventListener("blur", () => {
        endereco.value = endereco.value.trim();
        validarEndereco();
    });
    form.onsubmit = evento => {
        evento.preventDefault();
        telefone.value = formatarTelefone(telefone.value);
        validarEndereco();
        if (!form.reportValidity()) return;
        const dados = Object.fromEntries(new FormData(form));
        const dadosSalvos = id === "form-perfil" ? { ...perfil } : {};
        ["email", "telefone", "endereco"].forEach(nome => {
            const valor = dados[nome].trim();
            if (valor) dadosSalvos[nome] = valor;
        });
        guardar("donnuts-perfil", dadosSalvos);
        Object.assign(perfil, dadosSalvos);
        aviso("Dados salvos com sucesso.");
    };
});
const login = document.getElementById("form-login");
if (login) login.onsubmit = evento => {
    evento.preventDefault();
    entrar();
};
const pagamento = document.getElementById("pagamento");
if (pagamento) pagamento.onclick = () => {
    if (!estaLogado()) {
        sessionStorage.setItem("donnuts-voltar-carrinho", "true");
        location.href = "cadastro.html";
        return;
    }
    if (!total()) return;
    guardar("donnuts-pedido", { itens: carrinho, total: total(), endereco: perfil.endereco || "*Endereço*", numero: Date.now().toString().slice(-8) });
    guardar("donnuts-carrinho", {});
    location.href = "pedido.html";
};
const resumo = document.getElementById("pedido-itens");
if (resumo) {
    const pedido = ler("donnuts-pedido", null);
    if (pedido) {
        resumo.replaceChildren();
        produtos.forEach(produto => {
            if (!pedido.itens[produto.id]) return;
            const linha = document.createElement("p");
            linha.textContent = "Donutts " + produto.name + " - x" + pedido.itens[produto.id];
            resumo.append(linha);
        });
        document.getElementById("numero-pedido").textContent = pedido.numero;
        document.getElementById("pedido-total").textContent = "Valor Total: " + dinheiro(pedido.total);
        document.getElementById("pedido-endereco").textContent = "Entrega: " + pedido.endereco;
    }
}
