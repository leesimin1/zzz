/* global GEN, S, fh, f */

(() => {
  const templates = document.getElementById('tpl');
  const custom = document.getElementById('gens');
  if (!templates || !custom) return;

  const grid = document.createElement('div');
  grid.className = 'source-grid';
  templates.before(grid);
  grid.append(templates, custom);
  custom.className = 'tpl';
  custom.setAttribute('role', 'group');
  custom.setAttribute('aria-label', '직접 추가한 발전원');

  window.renderGens = function () {
    custom.replaceChildren();
    for (const source of GEN.filter((item) => !item.tpl)) {
      const on = Boolean(S.gen[source.k]);
      const card = document.createElement('div');
      card.className = `source-card${on ? ' on' : ''}`;

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'source-main';
      toggle.setAttribute('aria-pressed', String(on));
      const name = document.createElement('span');
      name.className = 'nm';
      const dot = document.createElement('i');
      dot.className = 'dot';
      dot.style.backgroundColor = source.col;
      dot.setAttribute('aria-hidden', 'true');
      name.append(dot, document.createTextNode(source.n));
      const description = document.createElement('small');
      description.textContent = `${fh(source.s)}–${fh(source.e)}시 · ${f(source.kw, 1)} kW`;
      toggle.append(name, description);
      toggle.onclick = () => {
        S.gen[source.k] = !S.gen[source.k];
        toggle.setAttribute('aria-pressed', String(S.gen[source.k]));
        card.classList.toggle('on', S.gen[source.k]);
        window.render();
      };

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'source-remove';
      remove.dataset.gx = source.k;
      remove.setAttribute('aria-label', `${source.n} 삭제`);
      remove.title = '삭제';
      remove.textContent = '×';
      card.append(toggle, remove);
      custom.appendChild(card);
    }
  };

  window.renderGens();
})();
