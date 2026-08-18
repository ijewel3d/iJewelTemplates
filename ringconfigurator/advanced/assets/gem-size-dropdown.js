/* =====================================================================
   Gem Size (Carat) Dropdown — assets/gem-size-dropdown.js
   ---------------------------------------------------------------------
   Self-contained dropdown for choosing a center-stone carat weight.

   Usage:
       const dd = createGemSizeDropdown({
           options: [
               { label: '0.50 ct', value: '0.5ct', sub: 'Petite' },
               { label: '1.00 ct', value: '1.0ct', sub: 'Classic' },
               { label: '2.00 ct', value: '2.0ct', sub: 'Statement' }
           ],
           value: '1.0ct',
           placeholder: 'Choose carat size',
           onChange: (value, option) => { ... }
       });
       container.appendChild(dd.element);

       // Later:
       dd.setOptions([...]);     // replace option list
       dd.setValue('0.5ct');     // update selection programmatically
       dd.setLoading(true);      // visual lock while applying

   Exposes:  window.createGemSizeDropdown(config)
   ===================================================================== */

(function () {
    'use strict';

    // ── Helpers ───────────────────────────────────────────────────────
    const el = (tag, attrs = {}, kids = []) => {
        const n = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'class') n.className = v;
            else if (k === 'text') n.textContent = v;
            else if (k === 'html') n.innerHTML = v;
            else if (k.startsWith('data-') || k.startsWith('aria-')) n.setAttribute(k, v);
            else n[k] = v;
        }
        for (const c of [].concat(kids)) {
            if (c == null) continue;
            n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
        }
        return n;
    };

    const CHEVRON_SVG = '<svg class="gsd-chevron" viewBox="0 0 12 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1.5L6 6.5L11 1.5"/></svg>';

    // Parse "1.0ct" → 1.0 — accepts numbers too
    const parseCarat = (v) => {
        if (typeof v === 'number') return v;
        if (!v) return 0;
        const m = String(v).match(/([\d.]+)/);
        return m ? parseFloat(m[1]) : 0;
    };

    const formatCarat = (n) => {
        const num = parseCarat(n);
        if (!num) return '–';
        // 1 → "1.00", 0.5 → "0.50", 1.25 → "1.25"
        return num.toFixed(2).replace(/\.?0+$/, m => m === '' ? '' : (m.length === 2 ? '' : m));
    };

    // ── Component ─────────────────────────────────────────────────────
    function createGemSizeDropdown(config = {}) {
        const state = {
            options: Array.isArray(config.options) ? config.options.slice() : [],
            value: config.value ?? null,
            placeholder: config.placeholder || 'Select carat size',
            isOpen: false,
            activeIndex: -1,
            loading: false,
            // `labelMode: 'label'` skips the carat-number reformat entirely and
            // uses opt.label verbatim — for sizes that aren't carats (e.g. band
            // widths like "Thin"/"Medium" or ring sizes "5"/"6"). Empty string
            // hides the trailing "ct" unit suffix in the menu.
            labelMode: config.labelMode === 'label' ? 'label' : 'auto',
            unit:      config.unit !== undefined ? config.unit : 'ct',
        };

        const onChange = typeof config.onChange === 'function' ? config.onChange : () => {};

        // DOM
        const root = el('div', { class: 'gem-size-dropdown' });
        const triggerText = el('div', { class: 'gsd-trigger-text' });
        const trigger = el('button', {
            class: 'gsd-trigger',
            type: 'button',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false'
        }, [triggerText]);
        trigger.insertAdjacentHTML('beforeend', CHEVRON_SVG);

        const menu = el('div', { class: 'gsd-menu', role: 'listbox' });

        root.appendChild(trigger);
        root.appendChild(menu);

        // ── Rendering ──
        function renderTrigger() {
            triggerText.innerHTML = '';
            const selected = findOption(state.value);
            if (selected) {
                const triggerLabel = state.labelMode === 'label'
                    ? (selected.label || String(selected.value))
                    : (selected.label || `${formatCarat(selected.value)} ct`);
                const primary = el('span', { class: 'gsd-trigger-primary', text: triggerLabel });
                triggerText.appendChild(primary);
                if (selected.sub) {
                    triggerText.appendChild(el('span', { class: 'gsd-trigger-secondary', text: selected.sub }));
                }
            } else {
                triggerText.appendChild(el('span', {
                    class: 'gsd-trigger-primary gsd-trigger-placeholder',
                    text: state.placeholder
                }));
            }
        }

        function renderMenu() {
            menu.innerHTML = '';
            if (!state.options.length) {
                menu.appendChild(el('div', { class: 'gsd-empty', text: 'No carat sizes available' }));
                return;
            }
            state.options.forEach((opt, idx) => {
                const isSelected = String(opt.value) === String(state.value);
                const isActive = idx === state.activeIndex;
                const node = el('div', {
                    class: `gsd-option${isSelected ? ' selected' : ''}${isActive ? ' active' : ''}`,
                    role: 'option',
                    'aria-selected': isSelected ? 'true' : 'false',
                    'data-index': idx
                });

                const main = el('div', { class: 'gsd-opt-main' });
                let mainText;
                if (state.labelMode === 'label') {
                    mainText = opt.label || String(opt.value);
                } else {
                    const caratNum = parseCarat(opt.value);
                    mainText = caratNum ? formatCarat(caratNum) : (opt.label || String(opt.value));
                }
                main.appendChild(el('span', { class: 'gsd-opt-carat', text: mainText }));
                if (state.unit) main.appendChild(el('span', { class: 'gsd-opt-unit', text: state.unit }));
                node.appendChild(main);

                if (opt.sub) node.appendChild(el('span', { class: 'gsd-opt-sub', text: opt.sub }));

                node.addEventListener('mousedown', (e) => e.preventDefault());
                node.addEventListener('click', () => select(opt.value, opt));
                node.addEventListener('mouseenter', () => {
                    state.activeIndex = idx;
                    refreshActiveStyles();
                });
                menu.appendChild(node);
            });
        }

        function refreshActiveStyles() {
            const nodes = menu.querySelectorAll('.gsd-option');
            nodes.forEach((n, i) => n.classList.toggle('active', i === state.activeIndex));
        }

        function findOption(value) {
            return state.options.find(o => String(o.value) === String(value)) || null;
        }

        // ── Open / close ──
        // The menu is pinned with `position: fixed` whenever the dropdown
        // is open so it can escape ancestors that clip via `overflow:
        // hidden` (e.g. the configurator's accordion sections). The
        // coordinates are recomputed on scroll/resize.
        function positionMenu() {
            const r = trigger.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.left     = `${r.left}px`;
            menu.style.top      = `${r.bottom + 4}px`;
            menu.style.width    = `${r.width}px`;
        }
        function clearMenuPosition() {
            menu.style.position = '';
            menu.style.left     = '';
            menu.style.top      = '';
            menu.style.width    = '';
        }
        function open() {
            if (state.isOpen || state.loading) return;
            state.isOpen = true;
            root.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            const selectedIdx = state.options.findIndex(o => String(o.value) === String(state.value));
            state.activeIndex = selectedIdx >= 0 ? selectedIdx : 0;
            renderMenu();
            positionMenu();
            document.addEventListener('mousedown', onDocMouseDown, true);
            document.addEventListener('keydown', onKeyDown, true);
            window.addEventListener('scroll', positionMenu, true);
            window.addEventListener('resize', positionMenu);
        }
        function close() {
            if (!state.isOpen) return;
            state.isOpen = false;
            root.classList.remove('open');
            trigger.setAttribute('aria-expanded', 'false');
            state.activeIndex = -1;
            document.removeEventListener('mousedown', onDocMouseDown, true);
            document.removeEventListener('keydown', onKeyDown, true);
            window.removeEventListener('scroll', positionMenu, true);
            window.removeEventListener('resize', positionMenu);
            clearMenuPosition();
        }

        function onDocMouseDown(e) {
            if (!root.contains(e.target)) close();
        }
        function onKeyDown(e) {
            if (!state.isOpen) return;
            if (e.key === 'Escape') { close(); trigger.focus(); }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                state.activeIndex = Math.min(state.options.length - 1, state.activeIndex + 1);
                refreshActiveStyles();
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.activeIndex = Math.max(0, state.activeIndex - 1);
                refreshActiveStyles();
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                const opt = state.options[state.activeIndex];
                if (opt) select(opt.value, opt);
            }
        }

        function select(value, opt) {
            if (String(state.value) === String(value)) { close(); return; }
            state.value = value;
            renderTrigger();
            close();
            onChange(value, opt || findOption(value));
        }

        trigger.addEventListener('click', () => {
            state.isOpen ? close() : open();
        });

        // ── Public API ──
        const api = {
            element: root,
            setOptions(options, opts = {}) {
                state.options = Array.isArray(options) ? options.slice() : [];
                if (opts.value !== undefined) state.value = opts.value;
                // If current value not in options, clear or pick first
                if (!findOption(state.value)) {
                    state.value = state.options[0]?.value ?? null;
                }
                renderTrigger();
                if (state.isOpen) renderMenu();
            },
            setValue(value, fire = false) {
                if (!findOption(value)) return;
                state.value = value;
                renderTrigger();
                if (state.isOpen) renderMenu();
                if (fire) onChange(value, findOption(value));
            },
            getValue() { return state.value; },
            setLoading(loading) {
                state.loading = !!loading;
                root.classList.toggle('loading', state.loading);
                if (state.loading) close();
            },
            setPlaceholder(text) {
                state.placeholder = text;
                renderTrigger();
            },
            destroy() {
                close();
                root.remove();
            }
        };

        renderTrigger();
        return api;
    }

    // Expose
    window.createGemSizeDropdown = createGemSizeDropdown;
})();
