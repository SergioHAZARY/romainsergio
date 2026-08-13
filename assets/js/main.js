/**
 * Romain Sergio — Portfolio
 * ---------------------------------------------------------------------------
 * 1. Configuration
 * 2. Fond animé (canvas)
 * 3. Glitch du titre (une seule passe)
 * 4. Révélation au défilement + jauges
 * 5. Navigation active
 * 6. Filtres projets
 * 7. Formulaire de contact (Web3Forms)
 * 8. Année du footer
 */

(function () {
    'use strict';

    /* =======================================================================
       1. Configuration
       ======================================================================= */

    /**
     * >>> À RENSEIGNER <<<
     * Clé d'accès Web3Forms (gratuite, 30 secondes) :
     *   1. Aller sur https://web3forms.com
     *   2. Saisir sergiohazary@gmail.com, recevoir la clé par email
     *   3. Remplacer la valeur ci-dessous par la clé reçue
     * Tant que la clé n'est pas renseignée, le formulaire bascule
     * automatiquement sur un email pré-rempli — aucun message n'est perdu.
     */
    var WEB3FORMS_KEY = 'REMPLACER_PAR_VOTRE_CLE_WEB3FORMS';

    var CONTACT_EMAIL = 'sergiohazary@gmail.com';
    var ENDPOINT = 'https://api.web3forms.com/submit';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =======================================================================
       2. Fond animé (canvas)
       ======================================================================= */

    /**
     * Réseau de points reliés par des segments courts.
     * Contraintes tenues volontairement :
     *  - densité proportionnelle à l'aire (pas un nombre fixe),
     *  - DPR plafonné à 1.5 (au-delà, coût GPU sans gain visible),
     *  - grille spatiale pour ne comparer que les voisins immédiats,
     *  - animation stoppée hors écran et onglet masqué.
     */
    function initBackground() {
        var canvas = document.getElementById('neural-bg');
        if (!canvas || reduceMotion) return;

        var ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        var LINK_DIST = 132;
        var nodes = [];
        var w = 0;
        var h = 0;
        var frame = null;
        var running = false;

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        }

        function seed() {
            // ~1 point pour 17 000 px², borné pour rester fluide sur mobile.
            var count = Math.round((w * h) / 17000);
            count = Math.max(26, Math.min(count, 96));

            nodes = [];
            for (var i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.28,
                    vy: (Math.random() - 0.5) * 0.28,
                    r: Math.random() * 1.5 + 0.7
                });
            }
        }

        /** Découpe l'écran en cellules de LINK_DIST : voisinage en O(n). */
        function buildGrid() {
            var cols = Math.max(1, Math.ceil(w / LINK_DIST));
            var rows = Math.max(1, Math.ceil(h / LINK_DIST));
            var cells = new Array(cols * rows);

            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                var cx = Math.min(cols - 1, Math.max(0, Math.floor(n.x / LINK_DIST)));
                var cy = Math.min(rows - 1, Math.max(0, Math.floor(n.y / LINK_DIST)));
                var key = cy * cols + cx;
                if (!cells[key]) cells[key] = [];
                cells[key].push(n);
            }

            return { cells: cells, cols: cols, rows: rows };
        }

        function drawLinks() {
            var grid = buildGrid();
            ctx.lineWidth = 0.5;

            for (var cy = 0; cy < grid.rows; cy++) {
                for (var cx = 0; cx < grid.cols; cx++) {
                    var here = grid.cells[cy * grid.cols + cx];
                    if (!here) continue;

                    // Cellule courante + 4 voisines : chaque paire vue une fois.
                    var pool = here.slice();
                    var offsets = [[1, 0], [-1, 1], [0, 1], [1, 1]];
                    for (var o = 0; o < offsets.length; o++) {
                        var nx = cx + offsets[o][0];
                        var ny = cy + offsets[o][1];
                        if (nx < 0 || nx >= grid.cols || ny >= grid.rows) continue;
                        var near = grid.cells[ny * grid.cols + nx];
                        if (near) pool = pool.concat(near);
                    }

                    for (var i = 0; i < here.length; i++) {
                        for (var j = 0; j < pool.length; j++) {
                            var a = here[i];
                            var b = pool[j];
                            if (a === b) continue;

                            var dx = a.x - b.x;
                            var dy = a.y - b.y;
                            var d2 = dx * dx + dy * dy;
                            if (d2 > LINK_DIST * LINK_DIST) continue;

                            var d = Math.sqrt(d2);
                            ctx.strokeStyle = 'rgba(34, 211, 238, ' + (0.5 * (1 - d / LINK_DIST)).toFixed(3) + ')';
                            ctx.beginPath();
                            ctx.moveTo(a.x, a.y);
                            ctx.lineTo(b.x, b.y);
                            ctx.stroke();
                        }
                    }
                }
            }
        }

        function tick() {
            ctx.clearRect(0, 0, w, h);

            for (var i = 0; i < nodes.length; i++) {
                var n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x <= 0 || n.x >= w) n.vx *= -1;
                if (n.y <= 0 || n.y >= h) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(34, 211, 238, 0.85)';
                ctx.fill();
            }

            drawLinks();
            frame = window.requestAnimationFrame(tick);
        }

        function start() {
            if (running) return;
            running = true;
            frame = window.requestAnimationFrame(tick);
        }

        function stop() {
            running = false;
            if (frame) window.cancelAnimationFrame(frame);
            frame = null;
        }

        resize();
        start();

        // L'animation ne tourne que si le hero est à l'écran et l'onglet actif.
        var hero = document.querySelector('.hero');
        if (hero && 'IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                entries[0].isIntersecting ? start() : stop();
            }).observe(hero);
        }

        document.addEventListener('visibilitychange', function () {
            document.hidden ? stop() : start();
        });

        window.addEventListener('resize', debounce(resize, 180));
    }

    /* =======================================================================
       3. Glitch du titre (une seule passe)
       ======================================================================= */

    function initGlitch() {
        var title = document.querySelector('.glitch');
        if (!title || reduceMotion) return;

        title.classList.add('is-playing');
        // 2 itérations × 620 ms, puis on retire la classe : plus aucun repaint.
        window.setTimeout(function () {
            title.classList.remove('is-playing');
        }, 1400);
    }

    /* =======================================================================
       4. Révélation au défilement + jauges
       ======================================================================= */

    function initReveal() {
        var targets = document.querySelectorAll('.reveal');
        if (!targets.length) return;

        if (!('IntersectionObserver' in window)) {
            forEach(targets, function (el) { el.classList.add('is-visible'); });
            fillMeters(document);
            return;
        }

        // threshold 0 : un seuil en pourcentage ne se déclenche jamais pour une
        // section beaucoup plus haute que le viewport (la grille de projets sur
        // mobile). On réagit donc au premier pixel visible, remonté de 60 px
        // pour que la révélation démarre juste avant l'entrée à l'écran.
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                fillMeters(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });

        forEach(targets, function (el) { observer.observe(el); });
    }

    /** Les jauges (compétences, langues) se remplissent à l'entrée à l'écran. */
    function fillMeters(scope) {
        forEach(scope.querySelectorAll('[data-level]'), function (bar) {
            bar.style.width = bar.getAttribute('data-level') + '%';
        });
    }

    /* =======================================================================
       5. Navigation active
       ======================================================================= */

    function initActiveNav() {
        var links = document.querySelectorAll('[data-section]');
        if (!links.length || !('IntersectionObserver' in window)) return;

        var sections = [];
        forEach(document.querySelectorAll('main section[id]'), function (s) {
            sections.push(s);
        });
        if (!sections.length) return;

        var visible = {};

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                visible[entry.target.id] = entry.isIntersecting
                    ? entry.intersectionRatio
                    : 0;
            });

            // La section la plus visible gagne ; en cas d'égalité, la première.
            var best = '';
            var bestRatio = 0;
            for (var i = 0; i < sections.length; i++) {
                var id = sections[i].id;
                if ((visible[id] || 0) > bestRatio) {
                    bestRatio = visible[id];
                    best = id;
                }
            }
            if (!best) return;

            forEach(links, function (link) {
                var on = link.getAttribute('data-section') === best;
                on ? link.setAttribute('aria-current', 'true')
                   : link.removeAttribute('aria-current');
            });
        }, { threshold: [0.1, 0.25, 0.5, 0.75] });

        sections.forEach(function (s) { observer.observe(s); });
    }

    /* =======================================================================
       6. Filtres projets
       ======================================================================= */

    function initFilters() {
        var buttons = document.querySelectorAll('.filter');
        var cards = document.querySelectorAll('.project');
        if (!buttons.length || !cards.length) return;

        var counter = document.getElementById('projects-count');

        forEach(buttons, function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.getAttribute('data-filter');

                forEach(buttons, function (b) {
                    b.setAttribute('aria-pressed', String(b === btn));
                });

                var shown = 0;
                forEach(cards, function (card) {
                    var match = filter === 'all' ||
                        card.getAttribute('data-category') === filter;
                    // [hidden] plutôt qu'une classe : retiré aussi de l'ordre
                    // de tabulation et de l'arbre d'accessibilité.
                    card.hidden = !match;
                    if (match) shown++;
                });

                if (counter) {
                    counter.textContent = shown + (shown > 1 ? ' projets affichés' : ' projet affiché');
                }
            });
        });
    }

    /* =======================================================================
       7. Formulaire de contact
       ======================================================================= */

    function initContactForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;

        var button = form.querySelector('button[type="submit"]');
        var buttonLabel = button.querySelector('.btn-label');
        var status = document.getElementById('form-status');
        var idleLabel = buttonLabel.textContent;

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            clearErrors(form);

            var invalid = validate(form);
            if (invalid) {
                report('error', 'Merci de corriger les champs signalés avant l’envoi.');
                invalid.focus();
                return;
            }

            // Honeypot rempli => robot. On simule un succès sans rien envoyer.
            if (form.elements.botcheck && form.elements.botcheck.value) {
                report('ok', 'Message envoyé. Merci !');
                form.reset();
                return;
            }

            if (!WEB3FORMS_KEY || WEB3FORMS_KEY.indexOf('REMPLACER') === 0) {
                fallbackToEmail(form);
                return;
            }

            send(form);
        });

        // L'erreur d'un champ disparaît dès que l'utilisateur le corrige.
        forEach(form.querySelectorAll('input, select, textarea'), function (input) {
            input.addEventListener('input', function () {
                var field = input.closest('.field');
                if (field) field.removeAttribute('data-invalid');
            });
        });

        function send(formEl) {
            setBusy(true);
            report(null, '');

            var payload = new FormData(formEl);
            payload.append('access_key', WEB3FORMS_KEY);
            payload.append('subject',
                'Portfolio — ' + (payload.get('subject') || 'Nouveau message'));
            payload.append('from_name', 'Portfolio romainsergio.web.app');

            // Garde-fou réseau : au-delà de 15 s, on propose le repli email.
            var controller = ('AbortController' in window) ? new AbortController() : null;
            var timer = window.setTimeout(function () {
                if (controller) controller.abort();
            }, 15000);

            window.fetch(ENDPOINT, {
                method: 'POST',
                body: payload,
                signal: controller ? controller.signal : undefined
            })
                .then(function (response) {
                    return response.json().then(function (data) {
                        return { ok: response.ok, data: data };
                    });
                })
                .then(function (result) {
                    if (!result.ok || result.data.success === false) {
                        throw new Error(result.data.message || 'Envoi refusé');
                    }
                    report('ok',
                        'Message bien reçu — merci ! Je réponds sous 24 à 48 heures ouvrées.');
                    formEl.reset();
                })
                .catch(function () {
                    report('error',
                        'L’envoi a échoué. Écrivez-moi directement à ' +
                        '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a> ' +
                        'ou réessayez dans un instant.');
                })
                .then(function () {
                    window.clearTimeout(timer);
                    setBusy(false);
                });
        }

        /** Sans clé Web3Forms : on ouvre le client mail pré-rempli. */
        function fallbackToEmail(formEl) {
            var data = new FormData(formEl);
            var body = [
                'Nom : ' + (data.get('name') || ''),
                'Email : ' + (data.get('email') || ''),
                'Service : ' + (data.get('service') || ''),
                '',
                data.get('message') || ''
            ].join('\n');

            window.location.href = 'mailto:' + CONTACT_EMAIL +
                '?subject=' + encodeURIComponent(data.get('subject') || 'Contact portfolio') +
                '&body=' + encodeURIComponent(body);

            report('ok',
                'Votre logiciel de messagerie s’ouvre avec le message pré-rempli. ' +
                'Il ne reste qu’à cliquer sur « Envoyer ».');
        }

        function setBusy(busy) {
            button.disabled = busy;
            form.setAttribute('aria-busy', String(busy));
            buttonLabel.textContent = busy ? 'Envoi en cours…' : idleLabel;

            var spinner = button.querySelector('.spinner');
            if (busy && !spinner) {
                spinner = document.createElement('span');
                spinner.className = 'spinner';
                button.insertBefore(spinner, button.firstChild);
            } else if (!busy && spinner) {
                spinner.remove();
            }
        }

        function report(state, message) {
            if (!state) {
                status.removeAttribute('data-state');
                status.innerHTML = '';
                return;
            }
            status.setAttribute('data-state', state);
            status.innerHTML = message;
        }
    }

    /** Validation maison : messages en français, ciblés par champ. */
    function validate(form) {
        var first = null;

        forEach(form.querySelectorAll('[required]'), function (input) {
            var field = input.closest('.field');
            var value = (input.value || '').trim();
            var error = '';

            if (!value) {
                error = 'Ce champ est obligatoire.';
            } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
                error = 'Adresse email invalide — exemple : nom@domaine.com';
            } else if (input.name === 'message' && value.length < 12) {
                error = 'Merci de détailler un peu votre demande (12 caractères minimum).';
            }

            if (!error) return;

            if (field) {
                field.setAttribute('data-invalid', '');
                var slot = field.querySelector('.field-error');
                if (slot) slot.textContent = error;
            }
            if (!first) first = input;
        });

        return first;
    }

    function clearErrors(form) {
        forEach(form.querySelectorAll('.field[data-invalid]'), function (field) {
            field.removeAttribute('data-invalid');
        });
    }

    /* =======================================================================
       8. Année du footer
       ======================================================================= */

    function initYear() {
        var slot = document.getElementById('year');
        if (slot) slot.textContent = String(new Date().getFullYear());
    }

    /* =======================================================================
       Utilitaires
       ======================================================================= */

    function forEach(list, fn) {
        Array.prototype.forEach.call(list, fn);
    }

    function debounce(fn, wait) {
        var timer;
        return function () {
            var args = arguments;
            window.clearTimeout(timer);
            timer = window.setTimeout(function () { fn.apply(null, args); }, wait);
        };
    }

    /* ======================================================================= */

    // Marqueur de présence de JavaScript : les styles qui masquent du contenu
    // avant révélation sont conditionnés à cette classe, pour que la page reste
    // entièrement lisible si le script ne se charge pas.
    document.documentElement.classList.add('js');

    initBackground();
    initGlitch();
    initReveal();
    initActiveNav();
    initFilters();
    initContactForm();
    initYear();
})();
