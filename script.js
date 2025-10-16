// Cores baseadas nos seus data-color definidos no HTML
const CORES_MODAL = ['roxo', 'azul', 'vermelho', 'laranja', 'verde'];

/**
 * Remove classes de cor antigas e aplica a classe de cor correspondente ao elemento clicado
 * no fundo do modal.
 * @param {HTMLElement} elementClicked O elemento <a> clicado que contém o atributo data-color.
 */
function applyModalColor(elementClicked) {
    // Busca o elemento interno do modal que contém o fundo (a área de conteúdo)
    const modalContent = document.querySelector('#info-modal .modal-content');
    // Pega o valor do atributo 'data-color' do banner clicado (ex: 'azul', 'vermelho')
    const color = elementClicked.getAttribute('data-color');

    // 1. Remove todas as classes de cor existentes para limpar o estado anterior
    CORES_MODAL.forEach(c => modalContent.classList.remove(`cor-${c}`));

    // 2. Adiciona a classe de cor correta (ex: 'cor-azul') ao modal-content
    if (color) {
        modalContent.classList.add(`cor-${color}`);
    }
}


/**
 * Abre o modal genérico (usado para DADOS PESSOAIS, FORMAÇÃO, EXPERIÊNCIA)
 * @param {HTMLElement} element O elemento <a> clicado (o 'this' do HTML).
 * @param {string} title O título a ser exibido no modal.
 * @param {string} contentHtml O HTML do conteúdo a ser exibido.
 */
function openModal(element, title, contentHtml) {
    // APLICAÇÃO DA COR
    applyModalColor(element); 

    // Pega os elementos
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // Define o título e o conteúdo
    modalTitle.innerText = title;
    modalBody.innerHTML = contentHtml;

    // Mostra o modal
    modal.style.display = 'flex';
}

function closeModal() {
    // Esconde o modal
    document.getElementById('info-modal').style.display = 'none';
}

// Opcional: Fechar o modal clicando fora dele
window.onclick = function(event) {
    const modal = document.getElementById('info-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

/**
 * Abre o modal de PROJETOS.
 * @param {HTMLElement} element O elemento <a> clicado (o 'this' do HTML).
 */
function openProjectsModal(element) {
    // APLICAÇÃO DA COR
    applyModalColor(element); 
    
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // Define o título do modal
    modalTitle.innerText = 'PROJETOS';

    // Define o conteúdo inicial: dois botões e o container do iframe
    modalBody.innerHTML = `
        <div style="text-align:center;">
            <button onclick="loadProject('trabalho/PRINCIPAL.html')" 
                    style="margin:10px; padding:10px 20px; font-size:16px; border:none; border-radius:8px; background-color:#ff6600; color:white; cursor:pointer;">
                Projeto 1
            </button>
            <button onclick="loadProject('site/index.html')" 
                    style="margin:10px; padding:10px 20px; font-size:16px; border:none; border-radius:8px; background-color:#ff9933; color:white; cursor:pointer;">
                Projeto 2
            </button>
        </div>
        <div id="project-frame-container" style="margin-top:20px;"></div>
    `;

    modal.style.display = 'flex';
}

function loadProject(projectPath) {
    const container = document.getElementById('project-frame-container');
    container.innerHTML = `
        <iframe src="${projectPath}" 
                style="width:100%; height:70vh; border:none; border-radius:10px;">
        </iframe>
    `;
}

/**
 * Abre o modal de REDES SOCIAIS.
 * @param {HTMLElement} element O elemento <a> clicado (o 'this' do HTML).
 */
function openModalSocial(element) {
    // APLICAÇÃO DA COR
    applyModalColor(element); 
    
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.innerText = "REDES SOCIAIS";
    modalBody.innerHTML = `
        <div class="social-buttons">
            <button class="social-btn instagram" onclick="openSocial('https://www.instagram.com/luis_guga00')">
                <img src="imagem/instagram.png" alt="Instagram" class="icon"> Instagram
            </button>
            <button class="social-btn linkedin" onclick="openSocial('https://www.linkedin.com/in/luis-gustavo-brandão-748a73319')">
                <img src="imagem/linkedin.png" alt="LinkedIn" class="icon"> LinkedIn
            </button>
            <button class="social-btn facebook" onclick="openSocial('https://www.facebook.com/luis.gustavo.947753?locale=pt_BR')">
                <img src="imagem/facebook.png" alt="Facebook" class="icon"> Facebook
            </button>
        </div>
    `;

    modal.style.display = 'flex';
}

function openSocial(url) {
    window.open(url, '_blank');
}

// NO ARQUIVO script.js

// ... (todo o código da função applyModalColor, openModal, closeModal, etc. permanece o mesmo) ...


function openProjectsModal(element) { // Recebe o elemento (this)
    // APLICAÇÃO DA COR (isso já estava correto)
    applyModalColor(element); 
    
    const modal = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    // Define o título do modal
    modalTitle.innerText = 'PROJETOS';

    // Define o conteúdo inicial: TRÊS BOTÕES e o container do iframe
    modalBody.innerHTML = `
        <div style="text-align:center;">
            <button onclick="loadProject('trabalho/PRINCIPAL.html')" 
                    style="margin:10px; padding:10px 20px; font-size:16px; border:none; border-radius:8px; background-color:#ff6600; color:white; cursor:pointer;">
                Projeto 1
            </button>
            <button onclick="loadProject('site/index.html')" 
                    style="margin:10px; padding:10px 20px; font-size:16px; border:none; border-radius:8px; background-color:#ff9933; color:white; cursor:pointer;">
                Projeto 2
            </button>
            <button onclick="loadProject('projeto/index.html')" 
                    style="margin:10px; padding:10px 20px; font-size:16px; border:none; border-radius:8px; background-color:#ff5500; color:white; cursor:pointer;">
                Projeto 3
            </button>
        </div>
        <div id="project-frame-container" style="margin-top:20px;"></div>
    `;

    modal.style.display = 'flex';
}



// ... (todo o código restante, incluindo loadProject, openModalSocial, continua o mesmo) ...