/* Global Search Widget for Casa Nuvera
 * - Injects a compact search bar beneath the hero section on any page
 * - Redirects to compras.html or arriendos.html with URL params
 */
(function () {
  function createEl(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    return wrapper.firstElementChild;
  }

  function buildHTML(defaults) {
    const op = (defaults && defaults.operation) || '';
    const type = (defaults && defaults.type) || '';
    const location = (defaults && defaults.location) || '';
    const projects = (defaults && defaults.projects) || false;

    return `
      <section class="global-search" id="globalSearch">
        <div class="search-grid">
          <div class="field">
            <select id="gs-operation">
              <option value="venta" ${op === 'venta' ? 'selected' : ''}>Venta</option>
              <option value="arriendo" ${op === 'arriendo' ? 'selected' : ''}>Arriendo</option>
            </select>
          </div>
          <div class="field">
            <select id="gs-type">
              <option value="">Tipo</option>
              <option value="Casa" ${type === 'Casa' ? 'selected' : ''}>Casa</option>
              <option value="Departamento" ${type === 'Departamento' ? 'selected' : ''}>Departamento</option>
              <option value="Oficina" ${type === 'Oficina' ? 'selected' : ''}>Oficina</option>
            </select>
          </div>
          <div class="field">
            <input id="gs-location" type="text" placeholder="Ingresa comuna o ciudad" value="${location.replace(/"/g, '&quot;')}">
          </div>
          <div class="field" style="display:flex;align-items:center;gap:8px;">
            <input id="gs-projects" type="checkbox" ${projects ? 'checked' : ''}>
            <label for="gs-projects" style="color:#666;font-size:0.9rem;">Proyectos</label>
          </div>
          <div class="field actions">
            <button class="btn primary" id="gs-submit">Buscar</button>
          </div>
          <div class="field actions">
            <a class="btn secondary" id="gs-map" href="#">Mapa</a>
          </div>
        </div>
      </section>
    `;
  }

  function handleSearch(root) {
    const operation = root.querySelector('#gs-operation').value || 'venta';
    const type = root.querySelector('#gs-type').value || '';
    const location = root.querySelector('#gs-location').value || '';
    const projects = root.querySelector('#gs-projects').checked ? '1' : '';

    const target = operation === 'arriendo' ? 'arriendos.html' : 'compras.html';
    const params = new URLSearchParams();
    params.set('op', operation);
    if (type) params.set('type', type);
    if (location) params.set('loc', location);
    if (projects) params.set('proj', projects);

    window.location.href = `${target}?${params.toString()}`;
  }

  function autoInject() {
    // Do not inject on the home if its own search already exists
    if (document.querySelector('.property-search-bar') || document.getElementById('globalSearch')) return;

    const mountAfter = document.querySelector('.hero') || document.querySelector('.header');
    if (!mountAfter) return;

    const node = createEl(buildHTML());
    mountAfter.parentNode.insertBefore(node, mountAfter.nextSibling);

    node.querySelector('#gs-submit').addEventListener('click', function (e) {
      e.preventDefault();
      handleSearch(node);
    });

    node.querySelector('#gs-map').addEventListener('click', function (e) {
      e.preventDefault();
      handleSearch(node); // Same behavior for now
    });
  }

  function initExisting() {
    const el = document.getElementById('globalSearch');
    if (!el) return;
    const submit = el.querySelector('#gs-submit');
    if (submit && !submit._bound) {
      submit._bound = true;
      submit.addEventListener('click', function (e) {
        e.preventDefault();
        handleSearch(el);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    autoInject();
    initExisting();
  });

  // Expose for manual rendering if needed
  window.GlobalSearch = {
    renderInto: function (container, defaults) {
      if (!container) return null;
      container.innerHTML = '';
      const node = createEl(buildHTML(defaults || {}));
      container.appendChild(node);
      node.querySelector('#gs-submit').addEventListener('click', function (e) {
        e.preventDefault();
        handleSearch(node);
      });
      return node;
    }
  };
})();

