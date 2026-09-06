(function () {
  const STORAGE_KEY = "yaritaikoto-jagarico-state";

  function loadOverrides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveOverrides(overrides) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    } catch (e) {
      // localStorage unavailable, state just won't persist
    }
  }

  const overrides = loadOverrides();

  const items = TODO_ITEMS.map((item, index) => ({
    index,
    text: item.text,
    done: overrides.hasOwnProperty(index) ? overrides[index] : item.done,
  }));

  const listEl = document.getElementById("todoList");
  const doneCountEl = document.getElementById("doneCount");
  const totalCountEl = document.getElementById("totalCount");
  const progressBarEl = document.getElementById("progressBar");
  const progressPercentEl = document.getElementById("progressPercent");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let currentFilter = "all";

  function render() {
    listEl.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (item.done ? " done" : "");
      li.dataset.index = item.index;

      const checkbox = document.createElement("span");
      checkbox.className = "todo-checkbox";
      checkbox.textContent = "✓";

      const text = document.createElement("span");
      text.className = "todo-text";
      text.textContent = item.text;

      li.appendChild(checkbox);
      li.appendChild(text);
      li.addEventListener("click", () => toggleItem(item.index));

      listEl.appendChild(li);
    });
    applyFilter();
    updateProgress();
  }

  function toggleItem(index) {
    const item = items.find((i) => i.index === index);
    item.done = !item.done;
    overrides[index] = item.done;
    saveOverrides(overrides);
    render();
  }

  function updateProgress() {
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

  render();
})();
