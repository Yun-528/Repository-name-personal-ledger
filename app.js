const STORAGE_KEY = "personal-ledger.entries.v1";
const BUDGET_KEY = "personal-ledger.monthly-budget.v1";
const CATEGORY_KEY = "personal-ledger.categories.v1";
const ADD_CATEGORY_VALUE = "__add_category__";
const ADD_SUBCATEGORY_VALUE = "__add_subcategory__";

const defaultCategoryTree = {
  expense: {
    餐饮: ["早餐", "午餐", "晚餐", "饮料零食", "外食"],
    交通: ["电车", "巴士", "出租车", "充值"],
    购物: ["日用品", "衣服", "电子产品"],
    房租: ["房租", "管理费"],
    水电煤: ["电费", "水费", "煤气费"],
    通信: ["手机费", "网络费"],
    医疗: ["药品", "看病"],
    学习: ["学费", "书籍", "考试费"],
    娱乐: ["游戏", "电影", "订阅"],
    其他: ["其他"],
  },
  income: {
    工资: ["正职工资", "兼职工资"],
    奖金: ["奖金"],
    转账: ["家人转账", "朋友转账"],
    其他: ["其他收入"],
  },
};

let categoryTree = loadCategoryTree();

const seedEntries = [
  createEntry({ type: "expense", amount: 38, category: "餐饮", subcategory: "午餐", date: todayISO(), note: "午餐" }),
  createEntry({ type: "expense", amount: 12, category: "交通", subcategory: "电车", date: todayISO(), note: "地铁" }),
  createEntry({ type: "income", amount: 5000, category: "工资", subcategory: "正职工资", date: todayISO(), note: "本月工资" }),
];

const state = {
  entries: loadEntries(),
  month: currentMonth(),
  selectedDate: todayISO(),
  type: "all",
  budget: Number(localStorage.getItem(BUDGET_KEY) || 0),
  editingId: null,
};

const form = document.querySelector("#entryForm");
const typeInputs = document.querySelectorAll("input[name='type']");
const amountInput = document.querySelector("#amount");
const categorySelect = document.querySelector("#category");
const subcategorySelect = document.querySelector("#subcategory");
const dateInput = document.querySelector("#date");
const noteInput = document.querySelector("#note");
const entryList = document.querySelector("#entryList");
const emptyState = document.querySelector("#emptyState");
const monthFilter = document.querySelector("#monthFilter");
const typeFilter = document.querySelector("#typeFilter");
const budgetInput = document.querySelector("#budget");
const calendarGrid = document.querySelector("#calendarGrid");
const calendarTitle = document.querySelector("#calendarTitle");
const selectedDateTitle = document.querySelector("#selectedDateTitle");
const dayList = document.querySelector("#dayList");
const dayIncome = document.querySelector("#dayIncome");
const dayExpense = document.querySelector("#dayExpense");
const dayBalance = document.querySelector("#dayBalance");
const formTitle = document.querySelector("#formTitle");
const submitEntry = document.querySelector("#submitEntry");
const cancelEdit = document.querySelector("#cancelEdit");
const backFromFormButton = document.querySelector("#backFromForm");
const appViews = document.querySelectorAll(".app-view");
const navLinks = document.querySelectorAll("[data-nav]");
const recordNav = document.querySelector("#recordNav");
const addForDayButton = document.querySelector("#addForDay");
const backToCalendarButton = document.querySelector("#backToCalendar");
const goCalendarButton = document.querySelector("#goCalendar");
const addTodayButton = document.querySelector("#addToday");
const homeRecentList = document.querySelector("#homeRecentList");
const renameCategoryButton = document.querySelector("#renameCategory");
const deleteCategoryButton = document.querySelector("#deleteCategory");
const renameSubcategoryButton = document.querySelector("#renameSubcategory");
const deleteSubcategoryButton = document.querySelector("#deleteSubcategory");

dateInput.value = state.selectedDate;
budgetInput.value = state.budget || "";
updateCategoryOptions("expense");
render();
renderRoute();

window.addEventListener("hashchange", renderRoute);

typeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    updateCategoryOptions(input.value);
  });
});

categorySelect.addEventListener("change", () => {
  const type = getSelectedType();
  if (categorySelect.value === ADD_CATEGORY_VALUE) {
    addCategory(type);
    return;
  }
  updateSubcategoryOptions(type, categorySelect.value);
});

subcategorySelect.addEventListener("change", () => {
  if (subcategorySelect.value === ADD_SUBCATEGORY_VALUE) {
    addSubcategory(getSelectedType(), categorySelect.value);
  }
});

renameCategoryButton.addEventListener("click", () => renameCategory(getSelectedType(), categorySelect.value));
deleteCategoryButton.addEventListener("click", () => deleteCategory(getSelectedType(), categorySelect.value));
renameSubcategoryButton.addEventListener("click", () =>
  renameSubcategory(getSelectedType(), categorySelect.value, subcategorySelect.value),
);
deleteSubcategoryButton.addEventListener("click", () =>
  deleteSubcategory(getSelectedType(), categorySelect.value, subcategorySelect.value),
);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const amount = Number(data.get("amount"));

  if (!Number.isFinite(amount) || amount <= 0) return;

  const existing = state.editingId ? state.entries.find((entry) => entry.id === state.editingId) : null;
  const record = createEntry(
    {
      id: state.editingId || crypto.randomUUID(),
      type: data.get("type"),
      amount,
      category: data.get("category"),
      subcategory: data.get("subcategory"),
      date: data.get("date"),
      note: data.get("note").trim(),
      createdAt: existing?.createdAt,
    },
    existing,
  );

  if (state.editingId) {
    state.entries = state.entries.map((entry) => (entry.id === state.editingId ? record : entry));
  } else {
    state.entries.unshift(record);
  }

  state.selectedDate = record.date;
  state.month = record.date.slice(0, 7);
  saveEntries();
  resetForm(record.date);
  render();
  navigateTo(`#day/${record.date}`);
});

entryList.addEventListener("click", handleRecordAction);
dayList.addEventListener("click", handleRecordAction);
homeRecentList.addEventListener("click", handleRecordAction);

calendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  navigateTo(`#day/${button.dataset.date}`);
});

addForDayButton.addEventListener("click", () => navigateTo(`#add/${state.selectedDate}`));
backToCalendarButton.addEventListener("click", () => navigateTo("#calendar"));
goCalendarButton.addEventListener("click", () => navigateTo("#calendar"));
addTodayButton.addEventListener("click", () => navigateTo(`#add/${todayISO()}`));
recordNav.addEventListener("click", (event) => {
  event.preventDefault();
  navigateTo(`#add/${state.selectedDate || todayISO()}`);
});

monthFilter.addEventListener("change", () => {
  state.month = monthFilter.value;
  if (!state.selectedDate.startsWith(state.month)) {
    state.selectedDate = `${state.month}-01`;
    dateInput.value = state.selectedDate;
  }
  render();
});

typeFilter.addEventListener("change", () => {
  state.type = typeFilter.value;
  render();
});

budgetInput.addEventListener("input", () => {
  state.budget = Number(budgetInput.value || 0);
  localStorage.setItem(BUDGET_KEY, String(state.budget));
  renderBudget();
});

document.querySelector("#prevMonth").addEventListener("click", () => shiftMonth(-1));
document.querySelector("#nextMonth").addEventListener("click", () => shiftMonth(1));
cancelEdit.addEventListener("click", () => {
  const targetDate = dateInput.value || state.selectedDate || todayISO();
  resetForm(targetDate);
  navigateTo(`#day/${targetDate}`);
});

backFromFormButton.addEventListener("click", () => {
  const targetDate = dateInput.value || state.selectedDate || todayISO();
  if (state.editingId) resetForm(targetDate);
  navigateTo(`#day/${targetDate}`);
});

document.querySelector("#clearAll").addEventListener("click", () => {
  if (!state.entries.length) return;
  const confirmed = confirm("确定清空所有记账记录吗？此操作不能撤销。");
  if (!confirmed) return;
  state.entries = [];
  saveEntries();
  resetForm(state.selectedDate);
  render();
});

document.querySelector("#exportJson").addEventListener("click", () => {
  const payload = JSON.stringify({ entries: state.entries.map(normalizeEntry), budget: state.budget, categories: categoryTree }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `personal-ledger-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector("#importJson").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    const importedEntries = Array.isArray(payload) ? payload : payload.entries;
    if (!Array.isArray(importedEntries)) throw new Error("Invalid file");

    if (payload.categories) categoryTree = sanitizeCategoryTree(payload.categories);

    state.entries = importedEntries
      .filter((entry) => entry.date && entry.type && Number(entry.amount) > 0)
      .map(normalizeEntry)
      .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt));

    if (Number(payload.budget) >= 0) {
      state.budget = Number(payload.budget);
      budgetInput.value = state.budget || "";
      localStorage.setItem(BUDGET_KEY, String(state.budget));
    }

    saveCategoryTree();
    saveEntries();
    resetForm(state.selectedDate);
    render();
  } catch {
    alert("导入失败，请选择由本应用导出的 JSON 文件。");
  } finally {
    event.target.value = "";
  }
});

function render() {
  renderMonthOptions();

  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(state.month));
  const visibleEntries = monthEntries.filter((entry) => state.type === "all" || entry.type === state.type);
  const income = sum(monthEntries.filter((entry) => entry.type === "income"));
  const expense = sum(monthEntries.filter((entry) => entry.type === "expense"));

  document.querySelector("#monthBalance").textContent = money(income - expense);
  document.querySelector("#monthIncome").textContent = money(income);
  document.querySelector("#monthExpense").textContent = money(expense);
  document.querySelector("#totalCount").textContent = String(state.entries.length);

  entryList.innerHTML = visibleEntries
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
    .map(renderEntryCard)
    .join("");

  emptyState.style.display = visibleEntries.length ? "none" : "block";
  renderCalendar(monthEntries);
  renderDay();
  renderHome();
  renderCategories(monthEntries);
  renderBudget(expense);
  updateRecordNav();
}

function parseRoute() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const [name, param] = hash.split("/");
  const allowed = ["home", "calendar", "day", "add", "edit", "stats", "settings"];
  return allowed.includes(name) ? { name, param } : { name: "home" };
}

function renderRoute() {
  const route = parseRoute();

  if (route.name === "day") {
    const date = validDate(route.param) ? route.param : todayISO();
    state.selectedDate = date;
    state.month = date.slice(0, 7);
    dateInput.value = date;
  }

  if (route.name === "add") {
    const date = validDate(route.param) ? route.param : state.selectedDate || todayISO();
    state.selectedDate = date;
    state.month = date.slice(0, 7);
    resetForm(date);
  }

  if (route.name === "edit") {
    if (!prepareEditRoute(route.param)) return;
  }

  render();
  showView(viewForRoute(route.name));
  setActiveTab(route.name);
}

function viewForRoute(routeName) {
  const map = {
    home: "homeView",
    calendar: "calendarView",
    day: "dayView",
    add: "recordFormView",
    edit: "recordFormView",
    stats: "statsView",
    settings: "settingsView",
  };
  return map[routeName] || "homeView";
}

function showView(viewId) {
  appViews.forEach((view) => {
    view.hidden = view.id !== viewId;
  });
}

function setActiveTab(routeName) {
  const active = routeName === "add" || routeName === "edit" ? "record" : routeName;
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.nav === active);
  });
}

function navigateTo(hash) {
  if (location.hash === hash) {
    renderRoute();
    return;
  }
  location.hash = hash;
}

function updateRecordNav() {
  recordNav.href = `#add/${state.selectedDate || todayISO()}`;
}

function prepareEditRoute(id) {
  const entry = state.entries.find((item) => item.id === id);
  if (!entry) {
    navigateTo("#home");
    return false;
  }

  state.editingId = id;
  state.selectedDate = entry.date;
  state.month = entry.date.slice(0, 7);
  setFormType(entry.type);
  amountInput.value = entry.amount;
  updateCategoryOptions(entry.type, entry.category, entry.subcategory);
  dateInput.value = entry.date;
  noteInput.value = entry.note || "";
  formTitle.textContent = "编辑记录";
  submitEntry.textContent = "保存修改";
  cancelEdit.hidden = false;
  return true;
}

function renderMonthOptions() {
  const months = [...new Set(state.entries.map((entry) => entry.date.slice(0, 7)))].sort().reverse();
  if (!months.includes(currentMonth())) months.unshift(currentMonth());
  if (!months.includes(state.month)) months.unshift(state.month);

  monthFilter.innerHTML = months
    .map((month) => `<option value="${month}" ${month === state.month ? "selected" : ""}>${month}</option>`)
    .join("");
}

function renderHome() {
  const recentEntries = [...state.entries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  homeRecentList.innerHTML =
    recentEntries.map(renderEntryCard).join("") || '<p class="empty-state is-visible">还没有记录，先添加今天的第一笔吧。</p>';
}

function renderCalendar(monthEntries) {
  calendarTitle.textContent = formatMonthTitle(state.month);

  const [year, month] = state.month.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month - 1, 1 - startOffset);
  const entriesByDate = groupByDate(state.entries);
  const days = [];

  for (let index = 0; index < 42; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    const iso = toISODate(date);
    const dayEntries = entriesByDate[iso] || [];
    const income = sum(dayEntries.filter((entry) => entry.type === "income"));
    const expense = sum(dayEntries.filter((entry) => entry.type === "expense"));
    const hasRecords = dayEntries.length > 0;
    const classes = [
      "calendar-day",
      iso.slice(0, 7) !== state.month ? "is-muted" : "",
      iso === todayISO() ? "is-today" : "",
      iso === state.selectedDate ? "is-selected" : "",
      hasRecords ? "has-records" : "",
    ]
      .filter(Boolean)
      .join(" ");

    days.push(`
      <button class="${classes}" type="button" data-date="${iso}" aria-label="${iso}">
        <span class="calendar-date">${date.getDate()}</span>
        <span class="record-dot" aria-hidden="true"></span>
        ${income ? `<span class="calendar-total income">+${compactMoney(income)}</span>` : ""}
        ${expense ? `<span class="calendar-total expense">-${compactMoney(expense)}</span>` : ""}
      </button>
    `);
  }

  calendarGrid.innerHTML = days.join("");
}

function renderDay() {
  const dayEntries = state.entries
    .filter((entry) => entry.date === state.selectedDate)
    .sort((a, b) => a.type.localeCompare(b.type) || b.updatedAt.localeCompare(a.updatedAt));
  const income = sum(dayEntries.filter((entry) => entry.type === "income"));
  const expense = sum(dayEntries.filter((entry) => entry.type === "expense"));

  selectedDateTitle.textContent = `${formatDateTitle(state.selectedDate)} 明细`;
  dayIncome.textContent = money(income);
  dayExpense.textContent = money(expense);
  dayBalance.textContent = money(income - expense);

  dayList.innerHTML =
    dayEntries.map(renderEntryCard).join("") ||
    '<p class="empty-state is-visible">这一天还没有记录，点击日期后可直接添加收入或支出。</p>';
}

function renderEntryCard(entry) {
  return `
    <article class="entry-card ${entry.type}" data-open-edit="${entry.id}">
      <div class="entry-icon">${entry.type === "income" ? "入" : "出"}</div>
      <div class="entry-meta">
        <strong>${escapeHTML(entry.category)} · ${escapeHTML(entry.subcategory || "其他")}</strong>
        <span>${entry.date}${entry.note ? ` · ${escapeHTML(entry.note)}` : ""}</span>
      </div>
      <strong class="amount-cell ${entry.type}">${entry.type === "income" ? "+" : "-"}${money(entry.amount)}</strong>
      <div class="entry-actions">
        <button class="small-button edit" data-edit="${entry.id}" type="button" title="编辑" aria-label="编辑">编辑</button>
        <button class="small-button delete" data-delete="${entry.id}" type="button" title="删除" aria-label="删除">删除</button>
      </div>
    </article>
  `;
}

function renderCategories(monthEntries) {
  const expenseEntries = monthEntries.filter((entry) => entry.type === "expense");
  const total = sum(expenseEntries);
  const grouped = expenseEntries.reduce((result, entry) => {
    const key = entry.category || "其他";
    result[key] = result[key] || { amount: 0, count: 0 };
    result[key].amount += entry.amount;
    result[key].count += 1;
    return result;
  }, {});

  document.querySelector("#categoryTotal").textContent = money(total);
  document.querySelector("#categoryList").innerHTML =
    Object.entries(grouped)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([category, data]) => {
        const percent = total ? Math.round((data.amount / total) * 100) : 0;
        return `
          <div class="category-row">
            <div>
              <strong>${escapeHTML(category)}</strong>
              <span>${data.count} 笔 · ${percent}%</span>
            </div>
            <div class="track"><span style="width: ${percent}%"></span></div>
            <strong>${money(data.amount)}</strong>
          </div>
        `;
      })
      .join("") || '<p class="empty-state is-visible">本月还没有支出。</p>';
}

function renderBudget(currentExpense) {
  const expense =
    currentExpense ?? sum(state.entries.filter((entry) => entry.date.startsWith(state.month) && entry.type === "expense"));
  const budget = state.budget;
  const percent = budget > 0 ? Math.min(100, Math.round((expense / budget) * 100)) : 0;
  const progress = document.querySelector("#budgetProgress");
  progress.style.width = `${percent}%`;
  progress.style.background = percent >= 90 ? "var(--red)" : percent >= 70 ? "var(--gold)" : "var(--green)";

  document.querySelector("#budgetText").textContent =
    budget > 0
      ? `本月已支出 ${money(expense)}，占预算 ${percent}%，剩余 ${money(Math.max(0, budget - expense))}。`
      : "设置月预算后，会显示本月支出进度。";
}

function handleRecordAction(event) {
  const actionButton = event.target.closest("button");
  const card = event.target.closest("[data-open-edit]");

  const editButton = event.target.closest("[data-edit]");
  if (editButton) {
    navigateTo(`#edit/${editButton.dataset.edit}`);
    return;
  }

  const deleteButton = event.target.closest("[data-delete]");
  if (!deleteButton) {
    if (card && !actionButton) navigateTo(`#edit/${card.dataset.openEdit}`);
    return;
  }

  const entry = state.entries.find((item) => item.id === deleteButton.dataset.delete);
  if (!entry) return;

  const confirmed = confirm(`确定删除 ${entry.date} 的这笔${entry.type === "income" ? "收入" : "支出"}吗？`);
  if (!confirmed) return;

  state.entries = state.entries.filter((item) => item.id !== entry.id);
  if (state.editingId === entry.id) resetForm(state.selectedDate);
  saveEntries();
  render();
}

function beginEdit(id) {
  const entry = state.entries.find((item) => item.id === id);
  if (!entry) return;

  state.editingId = id;
  state.selectedDate = entry.date;
  state.month = entry.date.slice(0, 7);
  setFormType(entry.type);
  amountInput.value = entry.amount;
  updateCategoryOptions(entry.type, entry.category, entry.subcategory);
  dateInput.value = entry.date;
  noteInput.value = entry.note || "";
  formTitle.textContent = "编辑记录";
  submitEntry.textContent = "保存修改";
  cancelEdit.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  render();
}

function resetForm(date = state.selectedDate) {
  state.editingId = null;
  form.reset();
  setFormType("expense");
  updateCategoryOptions("expense");
  dateInput.value = date;
  formTitle.textContent = "新增记录";
  submitEntry.textContent = "添加记录";
  cancelEdit.hidden = true;
}

function selectDate(date) {
  state.selectedDate = date;
  state.month = date.slice(0, 7);
  if (state.editingId) {
    resetForm(date);
  } else {
    dateInput.value = date;
  }
  render();
}

function shiftMonth(offset) {
  const [year, month] = state.month.split("-").map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  state.month = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  state.selectedDate = `${state.month}-01`;
  dateInput.value = state.selectedDate;
  if (state.editingId) resetForm(state.selectedDate);
  render();
}

function updateCategoryOptions(type, selectedCategory = "", selectedSubcategory = "") {
  const tree = categoryTree[type] || categoryTree.expense;
  const categoryNames = Object.keys(tree);
  const category = categoryNames.includes(selectedCategory) ? selectedCategory : categoryNames[0];
  categorySelect.innerHTML = categoryNames
    .map((name) => `<option value="${name}" ${name === category ? "selected" : ""}>${name}</option>`)
    .join("") + `<option value="${ADD_CATEGORY_VALUE}">+ 新增分类</option>`;
  updateSubcategoryOptions(type, category, selectedSubcategory);
}

function updateSubcategoryOptions(type, category, selectedSubcategory = "") {
  const baseOptions = categoryTree[type]?.[category] || ["其他"];
  const options = selectedSubcategory && !baseOptions.includes(selectedSubcategory) ? [selectedSubcategory, ...baseOptions] : baseOptions;
  const selected = options.includes(selectedSubcategory) ? selectedSubcategory : options[0];
  subcategorySelect.innerHTML = options
    .map((name) => `<option value="${name}" ${name === selected ? "selected" : ""}>${name}</option>`)
    .join("") + `<option value="${ADD_SUBCATEGORY_VALUE}">+ 新增小分类</option>`;
}

function addCategory(type) {
  const name = cleanName(prompt("请输入新的大分类名称："));
  const previous = getFirstCategory(type);

  if (!name) {
    updateCategoryOptions(type, previous);
    return;
  }

  if (categoryTree[type][name]) {
    alert("这个大分类已经存在。");
    updateCategoryOptions(type, name);
    return;
  }

  categoryTree[type][name] = ["其他"];
  saveCategoryTree();
  updateCategoryOptions(type, name);
}

function renameCategory(type, oldName) {
  if (!canManageCategory(type, oldName)) return;

  const newName = cleanName(prompt("请输入新的大分类名称：", oldName));
  if (!newName || newName === oldName) return;
  if (categoryTree[type][newName]) {
    alert("这个大分类已经存在。");
    return;
  }

  categoryTree[type][newName] = categoryTree[type][oldName];
  delete categoryTree[type][oldName];
  state.entries = state.entries.map((entry) =>
    entry.type === type && entry.category === oldName ? { ...entry, category: newName, updatedAt: new Date().toISOString() } : entry,
  );
  saveCategoryTree();
  saveEntries();
  updateCategoryOptions(type, newName);
  render();
}

function deleteCategory(type, category) {
  if (!canManageCategory(type, category)) return;

  const categoryNames = Object.keys(categoryTree[type]);
  if (categoryNames.length <= 1) {
    alert("至少需要保留一个大分类。");
    return;
  }

  const usedCount = state.entries.filter((entry) => entry.type === type && entry.category === category).length;
  const message = usedCount
    ? `大分类「${category}」已有 ${usedCount} 笔记录。删除后这些记录会改为「其他 / 未分类」。确定删除吗？`
    : `确定删除大分类「${category}」吗？`;
  if (!confirm(message)) return;

  ensureFallbackCategory(type);
  delete categoryTree[type][category];
  state.entries = state.entries.map((entry) =>
    entry.type === type && entry.category === category
      ? { ...entry, category: "其他", subcategory: "未分类", updatedAt: new Date().toISOString() }
      : entry,
  );

  saveCategoryTree();
  saveEntries();
  updateCategoryOptions(type, getFirstCategory(type));
  render();
}

function addSubcategory(type, category) {
  if (!canManageCategory(type, category)) return;

  const name = cleanName(prompt(`请输入「${category}」下的新小分类名称：`));
  if (!name) {
    updateSubcategoryOptions(type, category);
    return;
  }

  if (categoryTree[type][category].includes(name)) {
    alert("这个小分类已经存在。");
    updateSubcategoryOptions(type, category, name);
    return;
  }

  categoryTree[type][category].push(name);
  saveCategoryTree();
  updateSubcategoryOptions(type, category, name);
}

function renameSubcategory(type, category, oldName) {
  if (!canManageSubcategory(type, category, oldName)) return;

  const newName = cleanName(prompt("请输入新的小分类名称：", oldName));
  if (!newName || newName === oldName) return;
  if (categoryTree[type][category].includes(newName)) {
    alert("这个小分类已经存在。");
    return;
  }

  categoryTree[type][category] = categoryTree[type][category].map((name) => (name === oldName ? newName : name));
  state.entries = state.entries.map((entry) =>
    entry.type === type && entry.category === category && entry.subcategory === oldName
      ? { ...entry, subcategory: newName, updatedAt: new Date().toISOString() }
      : entry,
  );

  saveCategoryTree();
  saveEntries();
  updateSubcategoryOptions(type, category, newName);
  render();
}

function deleteSubcategory(type, category, subcategory) {
  if (!canManageSubcategory(type, category, subcategory)) return;

  const options = categoryTree[type][category];
  if (options.length <= 1) {
    alert("至少需要保留一个小分类。");
    return;
  }

  const usedCount = state.entries.filter(
    (entry) => entry.type === type && entry.category === category && entry.subcategory === subcategory,
  ).length;
  const message = usedCount
    ? `小分类「${subcategory}」已有 ${usedCount} 笔记录。删除后这些记录会改为「未分类」。确定删除吗？`
    : `确定删除小分类「${subcategory}」吗？`;
  if (!confirm(message)) return;

  categoryTree[type][category] = options.filter((name) => name !== subcategory);
  state.entries = state.entries.map((entry) =>
    entry.type === type && entry.category === category && entry.subcategory === subcategory
      ? { ...entry, subcategory: "未分类", updatedAt: new Date().toISOString() }
      : entry,
  );

  saveCategoryTree();
  saveEntries();
  updateSubcategoryOptions(type, category, categoryTree[type][category][0]);
  render();
}

function setFormType(type) {
  document.querySelector(`#${type}Type`).checked = true;
}

function getSelectedType() {
  return document.querySelector("input[name='type']:checked").value;
}

function canManageCategory(type, category) {
  if (!category || category === ADD_CATEGORY_VALUE || !categoryTree[type]?.[category]) {
    alert("请先选择一个有效的大分类。");
    updateCategoryOptions(type);
    return false;
  }
  return true;
}

function canManageSubcategory(type, category, subcategory) {
  if (!canManageCategory(type, category)) return false;
  if (!subcategory || subcategory === ADD_SUBCATEGORY_VALUE || !categoryTree[type][category].includes(subcategory)) {
    alert("请先选择一个有效的小分类。");
    updateSubcategoryOptions(type, category);
    return false;
  }
  return true;
}

function cleanName(value) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function getFirstCategory(type) {
  return Object.keys(categoryTree[type] || {})[0] || "其他";
}

function ensureFallbackCategory(type) {
  if (!categoryTree[type].其他) categoryTree[type].其他 = type === "income" ? ["其他收入"] : ["其他"];
}

function loadCategoryTree() {
  const raw = localStorage.getItem(CATEGORY_KEY);
  if (!raw) return structuredClone(defaultCategoryTree);

  try {
    return sanitizeCategoryTree(JSON.parse(raw));
  } catch {
    return structuredClone(defaultCategoryTree);
  }
}

function saveCategoryTree() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categoryTree));
}

function sanitizeCategoryTree(customTree) {
  const merged = { expense: {}, income: {} };
  ["expense", "income"].forEach((type) => {
    const source = customTree?.[type];
    if (!source || typeof source !== "object") {
      merged[type] = structuredClone(defaultCategoryTree[type]);
      return;
    }

    Object.entries(source).forEach(([category, subcategories]) => {
      const cleanCategory = cleanName(category);
      if (!cleanCategory) return;
      const cleanSubcategories = Array.isArray(subcategories)
        ? subcategories.map(cleanName).filter(Boolean)
        : [];
      const existing = merged[type][cleanCategory] || [];
      merged[type][cleanCategory] = [...new Set([...existing, ...cleanSubcategories])];
      if (!merged[type][cleanCategory].length) merged[type][cleanCategory] = ["其他"];
    });

    if (!Object.keys(merged[type]).length) merged[type] = structuredClone(defaultCategoryTree[type]);
  });
  return merged;
}

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedEntries;

  try {
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed : seedEntries;
    return entries.map(normalizeEntry);
  } catch {
    return seedEntries;
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries.map(normalizeEntry)));
}

function normalizeEntry(entry) {
  const type = entry.type === "income" ? "income" : "expense";
  const amount = Number(entry.amount || 0);
  const category = normalizeCategory(type, entry.category);
  const subcategory = normalizeSubcategory(type, category, entry.subcategory);
  const createdAt = entry.createdAt || new Date().toISOString();

  return {
    id: entry.id || crypto.randomUUID(),
    type,
    amount,
    category,
    subcategory,
    date: validDate(entry.date) ? entry.date : todayISO(),
    note: entry.note || "",
    createdAt,
    updatedAt: entry.updatedAt || createdAt,
  };
}

function createEntry(data, existing) {
  const now = new Date().toISOString();
  return normalizeEntry({
    ...existing,
    ...data,
    createdAt: data.createdAt || existing?.createdAt || now,
    updatedAt: now,
  });
}

function normalizeCategory(type, category) {
  if (categoryTree[type]?.[category]) return category;
  const cleanCategory = cleanName(category);
  if (cleanCategory) {
    categoryTree[type][cleanCategory] = ["未分类"];
    saveCategoryTree();
    return cleanCategory;
  }
  return categoryTree[type]?.其他 ? "其他" : Object.keys(categoryTree[type])[0];
}

function normalizeSubcategory(type, category, subcategory) {
  const options = categoryTree[type]?.[category] || ["其他"];
  if (options.includes(subcategory)) return subcategory;
  const cleanSubcategory = cleanName(subcategory) || "未分类";
  if (categoryTree[type]?.[category] && !categoryTree[type][category].includes(cleanSubcategory)) {
    categoryTree[type][category].push(cleanSubcategory);
    saveCategoryTree();
  }
  return cleanSubcategory;
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

function groupByDate(entries) {
  return entries.reduce((result, entry) => {
    result[entry.date] = result[entry.date] || [];
    result[entry.date].push(entry);
    return result;
  }, {});
}

function formatMonthTitle(month) {
  const [year, monthNumber] = month.split("-");
  return `${year}年${Number(monthNumber)}月`;
}

function formatDateTitle(date) {
  const [, month, day] = date.split("-");
  return `${Number(month)}月${Number(day)}日`;
}

function compactMoney(value) {
  if (value >= 10000) return `${Math.round(value / 1000) / 10}万`;
  return Math.round(value).toString();
}

function todayISO() {
  return toISODate(new Date());
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function currentMonth() {
  return todayISO().slice(0, 7);
}

function sum(entries) {
  return entries.reduce((total, entry) => total + Number(entry.amount || 0), 0);
}

function money(value) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}
