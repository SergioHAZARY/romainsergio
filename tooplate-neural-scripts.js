// JavaScript Document

// ---------------------------------------------------------------------------
// Le comportement d'origine du template est conservé (fond animé, navigation
// active, barres de compétences, filtres, révélation au défilement).
// Deux différences :
//   1. le formulaire de contact envoie réellement le message ; il se contentait
//      d'afficher « MESSAGE ENVOYÉ ! » sans rien transmettre ;
//   2. le fond animé est allégé et respecte prefers-reduced-motion.
// ---------------------------------------------------------------------------

// >>> À RENSEIGNER <<<
// Clé d'accès Web3Forms (gratuite) :
//   1. aller sur https://web3forms.com
//   2. saisir sergiohazary@gmail.com, la clé arrive par e-mail
//   3. remplacer la valeur ci-dessous par la clé reçue
// Sans clé, le formulaire bascule sur un e-mail pré-rempli : aucun message
// n'est perdu, mais l'envoi demande une action de plus au visiteur.
var WEB3FORMS_KEY = 'REMPLACER_PAR_VOTRE_CLE_WEB3FORMS';

var CONTACT_EMAIL = 'sergiohazary@gmail.com';
var WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Neural Network Background Animation
const canvas = document.getElementById('neural-bg');
const ctx = canvas ? canvas.getContext('2d') : null;
let nodes = [];
let mouse = { x: 0, y: 0 };
let animationFrame = null;
let animationRunning = false;
let viewW = 0;
let viewH = 0;

// Distance de liaison entre deux nœuds, en pixels CSS.
const LINK_DISTANCE = 150;

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > viewW) this.vx *= -1;
        if (this.y < 0 || this.y > viewH) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
    }
}

// Le canvas est dimensionné en pixels physiques, avec un plafond à 1.5x :
// au-delà, le coût de rendu double sans gain visible sur un fond flouté.
function resizeCanvas() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
}

function init() {
    nodes = [];
    // Densité proportionnelle à la surface plutôt qu'un nombre fixe : un
    // téléphone n'a pas à animer autant de nœuds qu'un écran de bureau.
    let count = Math.round((viewW * viewH) / 18000);
    count = Math.max(30, Math.min(count, 100));

    for (let i = 0; i < count; i++) {
        nodes.push(new Node(
            Math.random() * viewW,
            Math.random() * viewH
        ));
    }
}

// Les nœuds sont rangés dans une grille de cellules de LINK_DISTANCE : on ne
// compare que les voisins immédiats au lieu de toutes les paires possibles.
function connectNodes() {
    const cols = Math.max(1, Math.ceil(viewW / LINK_DISTANCE));
    const rows = Math.max(1, Math.ceil(viewH / LINK_DISTANCE));
    const cells = new Array(cols * rows);

    for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(n.x / LINK_DISTANCE)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(n.y / LINK_DISTANCE)));
        const key = cy * cols + cx;
        if (!cells[key]) cells[key] = [];
        cells[key].push(n);
    }

    ctx.lineWidth = 0.5;

    // Cellule courante + 4 voisines : chaque paire n'est vue qu'une fois.
    const offsets = [[1, 0], [-1, 1], [0, 1], [1, 1]];

    for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
            const here = cells[cy * cols + cx];
            if (!here) continue;

            let pool = here;
            for (let o = 0; o < offsets.length; o++) {
                const nx = cx + offsets[o][0];
                const ny = cy + offsets[o][1];
                if (nx < 0 || nx >= cols || ny >= rows) continue;
                const near = cells[ny * cols + nx];
                if (near) pool = pool.concat(near);
            }

            for (let i = 0; i < here.length; i++) {
                for (let j = 0; j < pool.length; j++) {
                    const a = here[i];
                    const b = pool[j];
                    if (a === b) continue;

                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > LINK_DISTANCE * LINK_DISTANCE) continue;

                    const distance = Math.sqrt(d2);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / LINK_DISTANCE})`;
                    ctx.stroke();
                }
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, viewW, viewH);

    nodes.forEach(node => {
        node.update();
        node.draw();
    });

    connectNodes();
    animationFrame = requestAnimationFrame(animate);
}

function startAnimation() {
    if (animationRunning || !ctx || reduceMotion) return;
    animationRunning = true;
    animationFrame = requestAnimationFrame(animate);
}

function stopAnimation() {
    animationRunning = false;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = null;
}

// Initialize and start animation
if (canvas && ctx && !reduceMotion) {
    resizeCanvas();
    startAnimation();

    // Inutile de dessiner quand l'onglet est en arrière-plan : cela consomme
    // du processeur et de la batterie pour rien.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    resizeCanvas();
}, 180));

// Mouse move effect
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Active state on scroll for all icon navs (sidebar + mobile)
function updateActiveNav() {
    const scrollPos = window.scrollY + 150;

    // Update each nav type separately
    ['.sidebar-icon', '.nav-icon-item'].forEach(selector => {
        const items = document.querySelectorAll(selector);
        if (!items.length) return;

        let currentItem = items[0];

        items.forEach(item => {
            const sectionId = item.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (!section) return;

            if (scrollPos >= section.offsetTop) {
                currentItem = item;
            }
        });

        items.forEach(i => {
            i.classList.remove('active');
            i.removeAttribute('aria-current');
        });
        currentItem.classList.add('active');
        // Signale la section courante aux lecteurs d'écran, pas seulement
        // visuellement via la classe « active ».
        currentItem.setAttribute('aria-current', 'true');
    });
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navbar = document.getElementById('navbar');
            const mobileNav = document.getElementById('mobile-icon-nav');
            const navHeight = (navbar && navbar.offsetHeight > 0) ? navbar.offsetHeight : (mobileNav ? mobileNav.offsetHeight : 60);
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        }
    });
});

// Le gestionnaire de défilement est appelé à chaque image plutôt qu'à chaque
// événement : le navigateur en émet bien plus qu'il n'affiche d'images.
let scrollScheduled = false;

function onScroll() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Fade in sections
    const sections = document.querySelectorAll('.fade-in');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            section.classList.add('visible');
        }
    });

    // Animate skill bars when visible
    animateSkillBars();

    // Animate language bars when visible
    animateLanguageBars();

    // Update active nav state (sidebar + mobile)
    updateActiveNav();
}

window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
        scrollScheduled = false;
        onScroll();
    });
});

// Skill bars animation
let skillBarsAnimated = false;

function animateSkillBars() {
    if (skillBarsAnimated) return;

    const skillsSection = document.getElementById('skills');
    if (!skillsSection) return;

    const rect = skillsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.8) {
        skillBarsAnimated = true;
        document.querySelectorAll('.skill-bar-fill').forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width + '%';
        });
    }
}

// Language bars animation (bloc Langues repris du CV)
let langBarsAnimated = false;

function animateLanguageBars() {
    if (langBarsAnimated) return;

    const block = document.querySelector('.languages-block');
    if (!block) return;

    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
        langBarsAnimated = true;
        document.querySelectorAll('.lang-fill').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width') + '%';
        });
    }
}

// Project filtering
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.getAttribute('data-filter');
        const cards = document.querySelectorAll('.project-card');
        let shown = 0;

        cards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                // hidden retire aussi la carte de l'ordre de tabulation, ce
                // qu'une simple classe CSS ne fait pas.
                card.hidden = false;
                card.classList.remove('hidden');
                card.style.animation = reduceMotion ? '' : 'fadeInUp 0.4s ease forwards';
                shown++;
            } else {
                card.hidden = true;
                card.classList.add('hidden');
            }
        });

        const counter = document.getElementById('projects-count');
        if (counter) {
            counter.textContent = shown + (shown > 1 ? ' projets affichés' : ' projet affiché');
        }
    });
});

// ---------------------------------------------------------------------------
// Formulaire de contact
// ---------------------------------------------------------------------------

const contactForm = document.getElementById('contact-form');

if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnLabel = submitBtn.querySelector('.btn-label');
    const statusBox = document.getElementById('form-status');
    const idleLabel = btnLabel.textContent;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        clearFieldErrors();

        const firstInvalid = validateForm();
        if (firstInvalid) {
            showStatus('error', 'Merci de corriger les champs signalés avant l’envoi.');
            firstInvalid.focus();
            return;
        }

        // Champ leurre rempli : c'est un robot. On affiche un succès sans rien
        // envoyer, pour ne pas lui indiquer qu'il a été détecté.
        if (contactForm.elements.botcheck && contactForm.elements.botcheck.value) {
            showStatus('ok', 'Message envoyé. Merci !');
            contactForm.reset();
            return;
        }

        if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf('REMPLACER') === 0) {
            fallbackToMailto();
            return;
        }

        sendForm();
    });

    // L'erreur d'un champ disparaît dès que le visiteur le corrige.
    contactForm.querySelectorAll('input, select, textarea').forEach(input => {
        const clear = () => {
            const group = input.closest('.form-group');
            if (group) group.classList.remove('is-invalid');
        };
        input.addEventListener('input', clear);
        input.addEventListener('change', clear);
    });

    function sendForm() {
        setBusy(true);
        showStatus(null, '');

        const data = new FormData(contactForm);
        data.append('access_key', WEB3FORMS_KEY);
        data.append('subject', 'Portfolio — ' + (data.get('subject') || 'Nouveau message'));
        data.append('from_name', 'Portfolio romainsergio.web.app');

        // Garde-fou réseau : au-delà de 15 s on propose le repli e-mail plutôt
        // que de laisser le visiteur devant un bouton bloqué.
        const controller = ('AbortController' in window) ? new AbortController() : null;
        const timer = setTimeout(() => {
            if (controller) controller.abort();
        }, 15000);

        fetch(WEB3FORMS_ENDPOINT, {
            method: 'POST',
            body: data,
            signal: controller ? controller.signal : undefined
        })
            .then(response => response.json().then(body => ({ ok: response.ok, body: body })))
            .then(result => {
                if (!result.ok || result.body.success === false) {
                    throw new Error(result.body.message || 'Envoi refusé');
                }
                showStatus('ok', 'Message bien reçu — merci ! Je réponds sous 24 à 48 heures ouvrées.');
                contactForm.reset();
            })
            .catch(() => {
                showStatus(
                    'error',
                    'L’envoi a échoué. Écrivez-moi directement à ' +
                    '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a> ' +
                    'ou réessayez dans un instant.'
                );
            })
            .then(() => {
                clearTimeout(timer);
                setBusy(false);
            });
    }

    // Sans clé Web3Forms : on ouvre le logiciel de messagerie pré-rempli.
    function fallbackToMailto() {
        const data = new FormData(contactForm);
        const body = [
            'Nom : ' + (data.get('name') || ''),
            'Email : ' + (data.get('email') || ''),
            'Service : ' + (data.get('service') || ''),
            '',
            data.get('message') || ''
        ].join('\n');

        window.location.href = 'mailto:' + CONTACT_EMAIL +
            '?subject=' + encodeURIComponent(data.get('subject') || 'Contact portfolio') +
            '&body=' + encodeURIComponent(body);

        showStatus(
            'ok',
            'Votre logiciel de messagerie s’ouvre avec le message pré-rempli. ' +
            'Il ne reste qu’à cliquer sur « Envoyer ».'
        );
    }

    function setBusy(busy) {
        submitBtn.disabled = busy;
        contactForm.setAttribute('aria-busy', String(busy));
        btnLabel.textContent = busy ? 'ENVOI EN COURS…' : idleLabel;

        let spinner = submitBtn.querySelector('.spinner');
        if (busy && !spinner) {
            spinner = document.createElement('span');
            spinner.className = 'spinner';
            submitBtn.insertBefore(spinner, submitBtn.firstChild);
        } else if (!busy && spinner) {
            spinner.remove();
        }
    }

    function showStatus(state, message) {
        if (!statusBox) return;
        if (!state) {
            statusBox.removeAttribute('data-state');
            statusBox.innerHTML = '';
            return;
        }
        statusBox.setAttribute('data-state', state);
        statusBox.innerHTML = message;
    }

    // Validation maison : messages en français, ciblés champ par champ.
    function validateForm() {
        let first = null;

        contactForm.querySelectorAll('[required]').forEach(input => {
            const group = input.closest('.form-group');
            const value = (input.value || '').trim();
            let error = '';

            if (!value) {
                error = 'Ce champ est obligatoire.';
            } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                error = 'Adresse email invalide — exemple : nom@domaine.com';
            } else if (input.name === 'message' && value.length < 12) {
                error = 'Merci de détailler un peu votre demande (12 caractères minimum).';
            }

            if (!error) return;

            if (group) {
                group.classList.add('is-invalid');
                const slot = group.querySelector('.field-error');
                if (slot) slot.textContent = error;
            }
            if (!first) first = input;
        });

        return first;
    }

    function clearFieldErrors() {
        contactForm.querySelectorAll('.form-group.is-invalid').forEach(group => {
            group.classList.remove('is-invalid');
        });
    }
}

// Année du pied de page : évite une date figée dans le HTML.
const yearSlot = document.getElementById('year');
if (yearSlot) {
    yearSlot.textContent = String(new Date().getFullYear());
}

// Premier passage : révèle ce qui est déjà à l'écran au chargement.
onScroll();

function debounce(fn, wait) {
    let timer;
    return function () {
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(null, args), wait);
    };
}
