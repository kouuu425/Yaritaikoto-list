(function () {
  const STATE_KEY = "yaritaikoto-jagarico-state";
  const EXTRA_KEY = "yaritaikoto-jagarico-extra-items";

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // localStorage unavailable, state just won't persist
    }
  }

  const overrides = loadJSON(STATE_KEY, {});
  const extraItems = loadJSON(EXTRA_KEY, []);

  const listEl = document.getElementById("todoList");
  const doneCountEl = document.getElementById("doneCount");
  const totalCountEl = document.getElementById("totalCount");
  const progressBarEl = document.getElementById("progressBar");
  const progressPercentEl = document.getElementById("progressPercent");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const addForm = document.getElementById("addForm");
  const addInput = document.getElementById("addInput");

  let currentFilter = "all";

  function buildItems() {
    const base = TODO_ITEMS.map((item, index) => ({
      key: "b" + index,
      text: item.text,
      done: overrides.hasOwnProperty(index) ? overrides[index] : item.done,
      custom: false,
    }));
    const extra = extraItems.map((item) => ({
      key: "e" + item.id,
      text: item.text,
      done: item.done,
      custom: true,
    }));
    return base.concat(extra);
  }

  function render() {
    const items = buildItems();
    listEl.innerHTML = "";

    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (item.done ? " done" : "");

      const checkbox = document.createElement("span");
      checkbox.className = "todo-checkbox";
      checkbox.textContent = "✓";

      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = item.text;

      li.appendChild(checkbox);
      li.appendChild(text);
      li.addEventListener("click", () => toggleItem(item.key));

      if (item.custom) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "todo-delete";
        del.textContent = "×";
        del.setAttribute("aria-label", "削除");
        del.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteItem(item.key);
        });
        li.appendChild(del);
      }

      listEl.appendChild(li);
    });

    applyFilter();
    updateProgress(items);
  }

  function toggleItem(key) {
    if (key.startsWith("b")) {
      const index = Number(key.slice(1));
      overrides[index] = !(overrides.hasOwnProperty(index) ? overrides[index] : TODO_ITEMS[index].done);
      saveJSON(STATE_KEY, overrides);
    } else {
      const id = key.slice(1);
      const item = extraItems.find((i) => String(i.id) === id);
      if (item) {
        item.done = !item.done;
        saveJSON(EXTRA_KEY, extraItems);
      }
    }
    render();
  }

  function deleteItem(key) {
    const id = key.slice(1);
    const index = extraItems.findIndex((i) => String(i.id) === id);
    if (index !== -1) {
      extraItems.splice(index, 1);
      saveJSON(EXTRA_KEY, extraItems);
      render();
    }
  }

  function addItem(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    extraItems.push({ id: Date.now() + Math.random().toString(36).slice(2), text: trimmed, done: false });
    saveJSON(EXTRA_KEY, extraItems);
    render();
  }

  function updateProgress(items) {
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    doneCountEl.textContent = done;
    totalCountEl.textContent = total;
    progressBarEl.style.width = percent + "%";
    progressPercentEl.textContent = percent;
  }

  function applyFilter() {
    listEl.classList.toggle("hide-done", currentFilter === "active");
    listEl.classList.toggle("hide-active", currentFilter === "done");
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addItem(addInput.value);
    addInput.value = "";
    addInput.focus();
  });

  render();
})();
