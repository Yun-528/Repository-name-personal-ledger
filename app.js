const STORAGE_KEY = "personal-ledger.entries.v1";
const BUDGET_KEY = "personal-ledger.monthly-budget.v1";
const CATEGORY_KEY = "personal-ledger.categories.v1";
const BUDGETS_KEY = "personal-ledger.budgets.v1";
const PROFILE_KEY = "personal-ledger.profile.v1";
const ADD_CATEGORY_VALUE = "__add_category__";
const ADD_SUBCATEGORY_VALUE = "__add_subcategory__";
const DEFAULT_SIMPLE_CATEGORY = "其他";
const DEFAULT_CATEGORY_ICON = "📁";
const ICON_CHOICES = [
  "🏠",
  "🛋️",
  "💡",
  "📱",
  "🍚",
  "🍞",
  "🍱",
  "🍜",
  "🧋",
  "🍽️",
  "🏪",
  "🚃",
  "🚲",
  "🚕",
  "🚗",
  "✈️",
  "🛍️",
  "🧴",
  "🍪",
  "📚",
  "💼",
  "💊",
  "🩺",
  "🎮",
  "💻",
  "👕",
  "✂️",
  "🏦",
  "🧾",
  "💴",
  "🎁",
  "📦",
];

const simpleCategories = [
  { name: "房租", icon: "🏠" },
  { name: "水电", icon: "💡" },
  { name: "话费网络", icon: "📱" },
  { name: "食品", icon: "🍚" },
  { name: "交通费", icon: "🚃" },
  { name: "兴趣爱好", icon: "🎮" },
  { name: "服装", icon: "👕" },
  { name: "医疗营养", icon: "💊" },
  { name: "日用消耗品", icon: "🧴" },
  { name: "年金保险", icon: "🧾" },
  { name: "简餐饮料", icon: "🧋" },
  { name: "学习用品", icon: "📚" },
  { name: "大型家具", icon: "🛋️" },
  { name: "机票船票", icon: "✈️" },
  { name: "油费", icon: "🚗" },
  { name: "人情往来", icon: "🎁" },
  { name: "工作相关", icon: "💼" },
  { name: "银行", icon: "🏦" },
  { name: "其他", icon: "📦" },
];

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
  analysisMonth: currentMonth(),
  type: "all",
  budget: Number(localStorage.getItem(BUDGET_KEY) || 0),
  budgets: loadBudgets(),
  profile: loadProfile(),
  editingId: null,
  recordInput: {
    type: "expense",
    expression: "",
    amount: 0,
    category: "",
    subcategory: "",
  },
  recordSimple: {
    type: "expense",
    category: DEFAULT_SIMPLE_CATEGORY,
    subcategory: DEFAULT_SIMPLE_CATEGORY,
  },
  recordCategoryReturn: "input",
  recordCategoryFocus: "",
  categoryForm: { mode: "new-category", type: "expense", category: "", subcategory: "", icon: DEFAULT_CATEGORY_ICON },
  categoryFormReturnHash: "",
};
state.recordDraft = state.recordInput;

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
const calculatorExpression = document.querySelector("#calculatorExpression");
const calculatorNext = document.querySelector("#calculatorNext");
const calculatorDelete = document.querySelector("#calculatorDelete");
const inputCategoryButton = document.querySelector("#inputCategoryButton");
const inputSelectedCategory = document.querySelector("#inputSelectedCategory");
const inputRecordDate = document.querySelector("#inputRecordDate");
const inputRecordNote = document.querySelector("#inputRecordNote");
const recordCategoryGroups = document.querySelector("#recordCategoryGroups");
const backToRecordInput = document.querySelector("#backToRecordInput");
const newCategoryButton = document.querySelector("#newCategoryButton");
const recordCategorySettingsList = document.querySelector("#recordCategorySettingsList");
const backFromCategorySettings = document.querySelector("#backFromCategorySettings");
const recordSubcategoryTitle = document.querySelector("#recordSubcategoryTitle");
const recordSubcategoryOptions = document.querySelector("#recordSubcategoryOptions");
const backToRecordCategory = document.querySelector("#backToRecordCategory");
const newSubcategoryButton = document.querySelector("#newSubcategoryButton");
const recordSubcategorySettingsTitle = document.querySelector("#recordSubcategorySettingsTitle");
const recordSubcategorySettingsList = document.querySelector("#recordSubcategorySettingsList");
const backFromSubcategorySettings = document.querySelector("#backFromSubcategorySettings");
const categoryFormTitle = document.querySelector("#categoryFormTitle");
const categoryFormName = document.querySelector("#categoryFormName");
const categoryIconGrid = document.querySelector("#categoryIconGrid");
const saveCategoryForm = document.querySelector("#saveCategoryForm");
const deleteCategoryForm = document.querySelector("#deleteCategoryForm");
const backFromCategoryForm = document.querySelector("#backFromCategoryForm");
const categoryFormContext = document.querySelector("#categoryFormContext");
const recordDetailTitle = document.querySelector("#recordDetailTitle");
const recordDetailIcon = document.querySelector("#recordDetailIcon");
const recordDetailPath = document.querySelector("#recordDetailPath");
const recordDetailAmount = document.querySelector("#recordDetailAmount");
const recordDetailCategoryRow = document.querySelector("#recordDetailCategoryRow");
const detailRecordDate = document.querySelector("#detailRecordDate");
const detailRecordDateLabel = document.querySelector("#detailRecordDateLabel");
const detailRecordNote = document.querySelector("#detailRecordNote");
const detailSaveRecord = document.querySelector("#detailSaveRecord");
const backToRecordSubcategory = document.querySelector("#backToRecordSubcategory");
const simpleAmount = document.querySelector("#simpleAmount");
const simpleDate = document.querySelector("#simpleDate");
const simpleNote = document.querySelector("#simpleNote");
const simpleCategoryPills = document.querySelector("#simpleCategoryPills");
const simpleSubcategoryField = document.querySelector("#simpleSubcategoryField");
const simpleSubcategory = document.querySelector("#simpleSubcategory");
const simpleMoreCategory = document.querySelector("#simpleMoreCategory");
const simpleSaveRecord = document.querySelector("#simpleSaveRecord");
const toast = document.querySelector("#toast");
const summaryDonut = document.querySelector("#summaryDonut");
const homeDonut = document.querySelector("#homeDonut");
const homeCover = document.querySelector("#homeCover");
const homeAvatar = document.querySelector("#homeAvatar");
const homeToday = document.querySelector("#homeToday");
const openProfilePanel = document.querySelector("#openProfilePanel");
const profilePanel = document.querySelector("#profilePanel");
const avatarInput = document.querySelector("#avatarInput");
const coverInput = document.querySelector("#coverInput");
const homeMonthExpenseCenter = document.querySelector("#homeMonthExpenseCenter");
const homeTodayExpense = document.querySelector("#homeTodayExpense");
const homeFoodExpense = document.querySelector("#homeFoodExpense");
const homeTrafficExpense = document.querySelector("#homeTrafficExpense");
const homeBudgetRemaining = document.querySelector("#homeBudgetRemaining");
const monthIncome = document.querySelector("#monthIncome");
const monthExpense = document.querySelector("#monthExpense");
const monthBalance = document.querySelector("#monthBalance");
const summaryExpenseCenter = document.querySelector("#summaryExpenseCenter");
const summaryIncome = document.querySelector("#summaryIncome");
const summaryExpense = document.querySelector("#summaryExpense");
const summaryBalance = document.querySelector("#summaryBalance");
const categoryList = document.querySelector("#categoryList");
const analysisSummaryRange = document.querySelector("#analysisSummaryRange");
const analysisBudgetRange = document.querySelector("#analysisBudgetRange");
const analysisSettingsRange = document.querySelector("#analysisSettingsRange");
const budgetMonthTotal = document.querySelector("#budgetMonthTotal");
const budgetMonthExpense = document.querySelector("#budgetMonthExpense");
const budgetMonthRemaining = document.querySelector("#budgetMonthRemaining");
const categoryBudgetList = document.querySelector("#categoryBudgetList");
const categoryBudgetSettings = document.querySelector("#categoryBudgetSettings");
const analysisCategoryTitle = document.querySelector("#analysisCategoryTitle");
const analysisCategoryBack = document.querySelector("#analysisCategoryBack");
const analysisCategoryEdit = document.querySelector("#analysisCategoryEdit");
const analysisCategoryRange = document.querySelector("#analysisCategoryRange");
const analysisCategoryDonut = document.querySelector("#analysisCategoryDonut");
const analysisCategoryCenterLabel = document.querySelector("#analysisCategoryCenterLabel");
const analysisCategoryCenter = document.querySelector("#analysisCategoryCenter");
const analysisCategoryTotalName = document.querySelector("#analysisCategoryTotalName");
const analysisCategoryTotalAmount = document.querySelector("#analysisCategoryTotalAmount");
const analysisSubcategoryList = document.querySelector("#analysisSubcategoryList");

dateInput.value = state.selectedDate;
inputRecordDate.value = state.selectedDate;
simpleDate.value = state.selectedDate;
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

document.querySelectorAll("[data-record-input-type]").forEach((button) => {
  button.addEventListener("click", () => {
    setRecordInputType(button.dataset.recordInputType);
  });
});

document.querySelectorAll("[data-simple-type]").forEach((button) => {
  button.addEventListener("click", () => {
    setSimpleType(button.dataset.simpleType);
  });
});

document.querySelectorAll("[data-calc-key]").forEach((button) => {
  button.addEventListener("click", () => pushCalculatorKey(button.dataset.calcKey));
});

calculatorDelete.addEventListener("click", deleteCalculatorKey);
calculatorNext.addEventListener("click", advanceRecordInput);
inputCategoryButton.addEventListener("click", () => {
  state.recordCategoryReturn = "input";
  navigateTo("#record/category");
});
recordCategoryGroups.addEventListener("click", handleRecordCategoryPick);
backToRecordInput.addEventListener("click", () => navigateTo(state.recordCategoryReturn === "simple" ? "#record/simple" : "#record/input"));
if (newCategoryButton) newCategoryButton.addEventListener("click", () => navigateTo("#record/category/new"));
recordCategorySettingsList.addEventListener("click", handleCategorySettingsPick);
backFromCategorySettings.addEventListener("click", () => navigateTo("#record/category"));
recordSubcategoryOptions.addEventListener("click", handleRecordSubcategoryPick);
backToRecordCategory.addEventListener("click", () => navigateTo("#record/category"));
if (newSubcategoryButton) newSubcategoryButton.addEventListener("click", () => navigateTo(`#record/subcategory/${encodeURIComponent(state.recordDraft.category || "")}/new`));
recordSubcategorySettingsList.addEventListener("click", handleSubcategorySettingsPick);
backFromSubcategorySettings.addEventListener("click", () => navigateTo(`#record/subcategory/${encodeURIComponent(state.recordDraft.category || "")}`));
categoryIconGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-icon-choice]");
  if (!button) return;
  state.categoryForm.icon = button.dataset.iconChoice || DEFAULT_CATEGORY_ICON;
  renderCategoryForm();
});
saveCategoryForm.addEventListener("click", saveCategoryFormData);
if (deleteCategoryForm) deleteCategoryForm.addEventListener("click", deleteCategoryFormData);
backFromCategoryForm.addEventListener("click", () => {
  if (state.categoryFormReturnHash) {
    const hash = state.categoryFormReturnHash;
    state.categoryFormReturnHash = "";
    navigateTo(hash);
    return;
  }
  if (state.categoryForm.mode.includes("subcategory")) {
    navigateTo(`#record/subcategory/${encodeURIComponent(state.categoryForm.category || state.recordDraft.category || "")}`);
    return;
  }
  navigateTo("#record/category");
});
detailSaveRecord.addEventListener("click", saveRecordInput);
recordDetailCategoryRow.addEventListener("click", () => {
  state.recordDraft.category = "";
  state.recordDraft.subcategory = "";
  navigateTo("#record/category");
});
detailRecordDate.addEventListener("change", () => {
  state.recordDraft.date = detailRecordDate.value;
  renderRecordDetail();
});
backToRecordSubcategory.addEventListener("click", () =>
  navigateTo(`#record/subcategory/${encodeURIComponent(state.recordDraft.category || "")}`),
);
simpleCategoryPills.addEventListener("click", handleSimpleCategoryPick);
simpleSubcategory.addEventListener("change", () => {
  state.recordSimple.subcategory = simpleSubcategory.value || state.recordSimple.category;
});
simpleMoreCategory.addEventListener("click", () => {
  state.recordCategoryReturn = "simple";
  navigateTo("#record/category");
});
simpleSaveRecord.addEventListener("click", saveRecordSimple);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const amount = Number(data.get("amount"));

  if (!Number.isFinite(amount) || amount <= 0) return;

  const record = saveEntryFromData({
    type: data.get("type"),
    amount,
    category: data.get("category"),
    subcategory: data.get("subcategory"),
    date: data.get("date"),
    note: data.get("note").trim(),
  });

  resetForm(record.date);
  render();
  navigateTo(`#history/day/${record.date}`);
});

entryList.addEventListener("click", handleRecordAction);
dayList.addEventListener("click", handleRecordAction);
homeRecentList.addEventListener("click", handleRecordAction);
categoryList.addEventListener("click", handleAnalysisCategoryAction);
if (analysisSubcategoryList) analysisSubcategoryList.addEventListener("click", handleAnalysisSubcategoryAction);
if (analysisCategoryBack) analysisCategoryBack.addEventListener("click", () => navigateTo("#analysis/summary"));
if (analysisCategoryEdit) {
  analysisCategoryEdit.addEventListener("click", () => {
    const category = analysisCategoryEdit.dataset.category || "";
    if (!category) return;
    state.recordDraft.type = "expense";
    state.categoryFormReturnHash = `#analysis/category/${encodeURIComponent(category)}`;
    navigateTo(`#record/category/edit/${encodeURIComponent(category)}`);
  });
}

calendarGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button) return;
  navigateTo(`#history/day/${button.dataset.date}`);
});

addForDayButton.addEventListener("click", () => navigateTo(`#record/input/${state.selectedDate}`));
backToCalendarButton.addEventListener("click", () => navigateTo("#history/calendar"));
goCalendarButton.addEventListener("click", () => navigateTo("#history/calendar"));
addTodayButton.addEventListener("click", () => navigateTo(`#record/input/${todayISO()}`));
recordNav.addEventListener("click", (event) => {
  event.preventDefault();
  navigateTo("#record/input");
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
  const budget = Number(budgetInput.value || 0);
  state.budget = budget;
  setMonthBudget(state.analysisMonth, budget);
  localStorage.setItem(BUDGET_KEY, String(budget));
  saveBudgets();
  renderBudget();
});

[
  ["#analysisSummaryPrev", -1],
  ["#analysisBudgetPrev", -1],
  ["#analysisSettingsPrev", -1],
  ["#analysisCategoryPrev", -1],
  ["#analysisSummaryNext", 1],
  ["#analysisBudgetNext", 1],
  ["#analysisSettingsNext", 1],
  ["#analysisCategoryNext", 1],
].forEach(([selector, offset]) => {
  const button = document.querySelector(selector);
  if (button) button.addEventListener("click", () => shiftAnalysisMonth(offset));
});

categoryBudgetSettings.addEventListener("input", (event) => {
  const input = event.target.closest("[data-category-budget]");
  if (!input) return;
  setCategoryBudget(state.analysisMonth, input.dataset.categoryBudget, Number(input.value || 0));
  saveBudgets();
  renderBudget();
});

openProfilePanel.addEventListener("click", () => {
  profilePanel.hidden = !profilePanel.hidden;
});
avatarInput.addEventListener("change", (event) => handleProfileImage(event, "avatar"));
coverInput.addEventListener("change", (event) => handleProfileImage(event, "cover"));

document.querySelector("#prevMonth").addEventListener("click", () => shiftMonth(-1));
document.querySelector("#nextMonth").addEventListener("click", () => shiftMonth(1));
cancelEdit.addEventListener("click", () => {
  const targetDate = dateInput.value || state.selectedDate || todayISO();
  resetForm(targetDate);
  navigateTo(`#history/day/${targetDate}`);
});

backFromFormButton.addEventListener("click", () => {
  const targetDate = dateInput.value || state.selectedDate || todayISO();
  if (state.editingId) resetForm(targetDate);
  navigateTo(`#history/day/${targetDate}`);
});

document.querySelector("#clearAll").addEventListener("click", () => {
  const confirmed = confirm("确定清空全部记账数据吗？此操作不能撤销。");
  if (!confirmed) return;
  const doubleConfirmed = confirm("请再次确认：将清空记录、预算和分类设置。");
  if (!doubleConfirmed) return;
  state.entries = [];
  state.budget = 0;
  state.budgets = { defaultMonthBudget: 0, months: {} };
  categoryTree = sanitizeCategoryTree(defaultCategoryTree);
  budgetInput.value = "";
  localStorage.setItem(BUDGET_KEY, "0");
  saveBudgets();
  saveCategoryTree();
  saveEntries();
  resetForm(state.selectedDate);
  render();
  showToast("已清空全部数据");
});

document.querySelector("#exportJson").addEventListener("click", () => {
  downloadBackup();
});

document.querySelector("#importJson").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const payload = JSON.parse(await file.text());
    const result = importBackup(payload);
    resetForm(state.selectedDate);
    render();
    renderRoute();
    showToast(`导入完成：新增 ${result.added} 条，更新 ${result.updated} 条`);
  } catch {
    alert("导入失败，请选择有效的 JSON 备份文件。");
  } finally {
    event.target.value = "";
  }
});

function buildBackupPayload() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    entries: state.entries.map(normalizeEntry),
    monthlyBudget: Number(localStorage.getItem(BUDGET_KEY) || state.budget || 0),
    categories: categoryTree || { expense: {}, income: {} },
    budgets: state.budgets || { defaultMonthBudget: 0, months: {} },
  };
}

function downloadBackup(payload = buildBackupPayload()) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `personal-ledger-backup-${todayISO()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function extractBackupPayload(payload) {
  const entries = Array.isArray(payload) ? payload : payload?.entries;
  if (!Array.isArray(entries)) throw new Error("Invalid entries");
  return {
    entries,
    categories: !Array.isArray(payload) && payload?.categories ? payload.categories : null,
    monthlyBudget: !Array.isArray(payload) ? payload.monthlyBudget ?? payload.budget : null,
    budgets: !Array.isArray(payload) && payload?.budgets ? payload.budgets : null,
  };
}

function importBackup(payload) {
  const backup = extractBackupPayload(payload);

  if (backup.categories) {
    categoryTree = mergeCategoryTrees(categoryTree, backup.categories);
    saveCategoryTree();
  }

  if (backup.monthlyBudget !== null && backup.monthlyBudget !== undefined && Number(backup.monthlyBudget) >= 0) {
    state.budget = Number(backup.monthlyBudget);
    budgetInput.value = state.budget || "";
    localStorage.setItem(BUDGET_KEY, String(state.budget));
  }

  if (backup.budgets) {
    state.budgets = mergeBudgets(state.budgets, backup.budgets);
    saveBudgets();
  }

  const normalizedEntries = backup.entries.reduce((items, entry) => {
    const amount = Number(entry?.amount);
    if (!Number.isFinite(amount) || amount <= 0) return items;
    items.push(normalizeEntry({ ...entry, amount }));
    return items;
  }, []);

  const byId = new Map(state.entries.map((entry) => [entry.id, entry]));
  let added = 0;
  let updated = 0;
  normalizedEntries.forEach((entry) => {
    if (byId.has(entry.id)) updated += 1;
    else added += 1;
    byId.set(entry.id, entry);
  });

  state.entries = [...byId.values()]
    .map(normalizeEntry)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  saveCategoryTree();
  saveEntries();
  return { added, updated };
}

function mergeCategoryTrees(currentTree, incomingTree) {
  const merged = sanitizeCategoryTree(currentTree);
  const incoming = sanitizeCategoryTree(incomingTree);

  ["expense", "income"].forEach((type) => {
    Object.entries(incoming[type] || {}).forEach(([category, incomingValue]) => {
      const incomingNode = normalizeCategoryNode(category, incomingValue);
      const currentNode = merged[type][category] ? normalizeCategoryNode(category, merged[type][category]) : null;
      if (!currentNode) {
        merged[type][category] = incomingNode;
        return;
      }

      const children = new Map(currentNode.children.map((child) => [child.name, child]));
      incomingNode.children.forEach((child) => {
        children.set(child.name, { ...children.get(child.name), ...child });
      });
      merged[type][category] = {
        icon: incomingNode.icon || currentNode.icon || defaultIconFor(category),
        children: [...children.values()],
      };
    });
  });

  return sanitizeCategoryTree(merged);
}

function mergeBudgets(currentBudgets, incomingBudgets) {
  const merged = sanitizeBudgets(currentBudgets || {});
  const incoming = sanitizeBudgets(incomingBudgets || {});
  merged.defaultMonthBudget = Number(incoming.defaultMonthBudget || merged.defaultMonthBudget || 0);

  Object.entries(incoming.months || {}).forEach(([month, config]) => {
    const current = merged.months[month] || { monthBudget: 0, categoryBudgets: {} };
    merged.months[month] = {
      monthBudget: Number(config.monthBudget || current.monthBudget || 0),
      categoryBudgets: { ...current.categoryBudgets, ...(config.categoryBudgets || {}) },
    };
  });

  return merged;
}

function render() {
  renderMonthOptions();

  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(state.month));
  const visibleEntries = monthEntries.filter((entry) => state.type === "all" || entry.type === state.type);
  const income = sum(monthEntries.filter((entry) => entry.type === "income"));
  const expense = sum(monthEntries.filter((entry) => entry.type === "expense"));

  document.querySelector("#monthBalance").textContent = money(income - expense);
  document.querySelector("#monthIncome").textContent = money(income);
  document.querySelector("#monthExpense").textContent = money(expense);
  const totalCount = document.querySelector("#totalCount");
  if (totalCount) totalCount.textContent = String(state.entries.length);

  entryList.innerHTML = visibleEntries
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
    .map(renderEntryCard)
    .join("");

  emptyState.style.display = visibleEntries.length ? "none" : "block";
  renderCalendar(monthEntries);
  renderDay();
  renderHome();
  renderCategories(monthEntries);
  renderBudget();
  updateRecordNav();
}

function parseRoute() {
  const hash = location.hash.replace(/^#/, "") || "home";
  const parts = hash.split("/");
  const [section, mode, param, action, extra] = parts;

  if (section === "home") return { section: "home" };
  if (section === "settings") return { section: "settings" };
  if (section === "edit") return { section: "edit", param: mode };

  if (section === "record") {
    const recordMode = ["input", "simple", "category", "subcategory", "detail"].includes(mode) ? mode : "input";
    return { section: "record", mode: recordMode, param, action, extra };
  }

  if (section === "history") {
    const historyMode = ["list", "calendar", "day"].includes(mode) ? mode : "list";
    return { section: "history", mode: historyMode, param };
  }

  if (section === "analysis") {
    if (mode === "category") return { section: "analysis", mode: "category", param };
    const analysisMode = mode === "budget" && param === "settings" ? "budget-settings" : ["summary", "budget"].includes(mode) ? mode : "summary";
    return { section: "analysis", mode: analysisMode };
  }

  if (section === "calendar") return { section: "history", mode: "calendar", legacy: "calendar" };
  if (section === "day") return { section: "history", mode: "day", param: mode, legacy: "day" };
  if (section === "add") return { section: "record", mode: "input", param: mode, legacy: "add" };
  if (section === "stats") return { section: "analysis", mode: "summary", legacy: "stats" };

  return { section: "home" };
}

function renderRoute() {
  const route = parseRoute();

  if (route.section === "history" && route.mode === "day") {
    const date = validDate(route.param) ? route.param : todayISO();
    state.selectedDate = date;
    state.month = date.slice(0, 7);
    dateInput.value = date;
  }

  if (route.section === "record" && ["input", "simple"].includes(route.mode)) {
    const date = validDate(route.param) ? route.param : todayISO();
    state.selectedDate = date;
    state.month = date.slice(0, 7);
    resetForm(date);
    inputRecordDate.value = date;
    simpleDate.value = date;
    detailRecordDate.value = date;
  }

  if (route.section === "edit") {
    if (!prepareEditRoute(route.param)) return;
  }

  if (route.section === "analysis" && route.mode === "category") {
    state.recordDraft.type = "expense";
    state.recordDraft.category = cleanName(decodeURIComponent(route.param || ""));
    state.recordDraft.subcategory = "";
  }

  render();
  renderRecordInput();
  renderRecordSimple();
  renderRecordCategory();
  renderRecordSubcategory(route.param);
  renderCategorySettings();
  renderSubcategorySettings(route.param);
  renderRecordDetail();
  prepareCategoryFormRoute(route);
  renderAnalysis();
  showView(viewForRoute(route));
  setActiveTab(route);
}

function viewForRoute(route) {
  if (route.section === "record" && route.mode === "category" && route.param === "settings") return "recordCategorySettingsView";
  if (route.section === "record" && route.mode === "subcategory" && route.action === "settings") return "recordSubcategorySettingsView";
  if (route.section === "record" && route.mode === "category" && ["new", "edit"].includes(route.param)) return "recordCategoryFormView";
  if (route.section === "record" && route.mode === "subcategory" && ["new", "edit"].includes(route.action)) return "recordCategoryFormView";
  if (route.section === "record" && route.mode === "category") return "recordCategoryView";
  if (route.section === "record" && route.mode === "subcategory") return "recordSubcategoryView";
  if (route.section === "record" && route.mode === "detail") return "recordDetailView";
  if (route.section === "record" && route.mode === "simple") return "recordSimpleView";
  if (route.section === "record") return "recordInputView";
  if (route.section === "history" && route.mode === "calendar") return "calendarView";
  if (route.section === "history" && route.mode === "day") return "dayView";
  if (route.section === "history") return "historyListView";
  if (route.section === "analysis" && route.mode === "budget-settings") return "analysisBudgetSettingsView";
  if (route.section === "analysis" && route.mode === "category") return "analysisCategoryView";
  if (route.section === "analysis" && route.mode === "budget") return "analysisBudgetView";
  if (route.section === "analysis") return "analysisSummaryView";
  if (route.section === "settings") return "settingsView";
  if (route.section === "edit") return "recordFormView";
  return "homeView";
}

function showView(viewId) {
  appViews.forEach((view) => {
    view.hidden = view.id !== viewId;
  });
  document.body.classList.toggle("is-home-route", viewId === "homeView");
}

function setActiveTab(route) {
  const active = route.section === "edit" ? "record" : route.section;
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
  recordNav.href = "#record/input";
}

function saveEntryFromData(data) {
  const existing = state.editingId ? state.entries.find((entry) => entry.id === state.editingId) : null;
  const record = createEntry(
    {
      id: state.editingId || crypto.randomUUID(),
      type: data.type,
      amount: Number(data.amount),
      category: cleanName(data.category),
      subcategory: cleanName(data.subcategory) || cleanName(data.category),
      date: data.date,
      note: (data.note || "").trim(),
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
  return record;
}

function renderRecordInput() {
  document.querySelectorAll("[data-record-input-type]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.recordInputType === state.recordDraft.type);
  });

  const display = state.recordDraft.expression || (state.recordDraft.amount ? String(state.recordDraft.amount) : "");
  calculatorExpression.textContent = display ? `¥${display}` : "¥0";
  inputSelectedCategory.textContent = state.recordDraft.category
    ? `分类：${state.recordDraft.category} / ${state.recordDraft.subcategory || state.recordDraft.category}`
    : "未选择分类";
  calculatorNext.textContent = "下一步";
  if (!inputRecordDate.value) inputRecordDate.value = state.selectedDate || todayISO();
}

function renderRecordCategory() {
  const type = state.recordCategoryReturn === "simple" ? state.recordSimple.type : state.recordDraft.type;
  const tree = categoryTree[type] || {};
  const categories = Object.keys(tree);
  const recent = recentCategoryPairs(type);

  recordCategoryGroups.innerHTML = `
    <div class="record-list-section">
      <h3>最近使用</h3>
      <div class="record-list">
        ${
          recent.length
            ? recent
                .map(
                  (item) => `
                    <button class="record-list-row" data-recent-category="${escapeHTML(item.category)}" data-recent-subcategory="${escapeHTML(
                      item.subcategory,
                    )}" type="button">
                      <span class="record-list-icon">${getSubcategoryIcon(item.category, item.subcategory, type)}</span>
                      <span><strong>${escapeHTML(item.category)}</strong><small>${escapeHTML(item.category)} > ${escapeHTML(
                        item.subcategory,
                      )}</small></span>
                      <b>›</b>
                    </button>
                  `,
                )
                .join("")
            : '<p class="empty-state is-visible">还没有最近使用</p>'
        }
      </div>
    </div>
    <div class="record-list-section">
      <h3>全部分类</h3>
      <div class="record-list">
        ${categories
          .map((category) => {
            const subcategories = getCategoryChildren(type, category);
            const summary = subcategories.slice(0, 3).join("、") || category;
            return `
              <button class="record-list-row" data-record-main-category="${escapeHTML(category)}" type="button">
                <span class="record-list-icon">${getCategoryIcon(category, type)}</span>
                <span><strong>${escapeHTML(category)}</strong><small>${escapeHTML(summary)}</small></span>
                <b>›</b>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
    <button class="category-settings-link" data-add-category-direct type="button">
      <span class="record-list-icon">+</span>
      <span><strong>新增分类</strong></span>
      <b>›</b>
    </button>
  `;
}

function renderRecordSubcategory(routeCategory) {
  const category = cleanName(decodeURIComponent(routeCategory || state.recordDraft.category || ""));
  const type = state.recordDraft.type;
  if (category) state.recordDraft.category = category;
  const subcategories = getCategoryChildren(type, category);

  recordSubcategoryTitle.textContent = category || "选择子分类";
  const subcategoryRows = subcategories.length
    ? subcategories
        .map(
          (subcategory) =>
            `<button class="record-list-row ${state.recordDraft.subcategory === subcategory ? "is-selected" : ""}" data-record-subcategory-choice="${escapeHTML(
              subcategory,
            )}" data-record-category-choice="${escapeHTML(category)}" type="button">
              <span class="record-list-icon">${getSubcategoryIcon(category, subcategory, type)}</span>
              <span><strong>${escapeHTML(subcategory)}</strong><small>${escapeHTML(category)}</small></span>
              <b>›</b>
            </button>`,
        )
        .join("")
    : '<p class="empty-state is-visible">暂无子分类</p>';

  recordSubcategoryOptions.innerHTML = subcategoryRows + `
      <button class="category-settings-link" data-add-subcategory-direct="${escapeHTML(category)}" type="button">
        <span class="record-list-icon">+</span>
        <span><strong>新增子分类</strong></span>
        <b>›</b>
      </button>
    `;
}

function renderCategorySettings() {
  const type = state.recordCategoryReturn === "simple" ? state.recordSimple.type : state.recordDraft.type;
  const categories = Object.keys(categoryTree[type] || {});
  recordCategorySettingsList.innerHTML = `
    <div class="record-list">
      <button class="record-list-row category-add-row" data-add-category type="button">
        <span class="record-list-icon">+</span>
        <span><strong>添加分类</strong><small>添加新的一级分类</small></span>
        <b>›</b>
      </button>
    </div>
    <div class="record-list-section">
      <h3>已注册分类</h3>
      <div class="record-list">
        ${categories
          .map(
            (category) => `
              <button class="record-list-row" data-settings-category="${escapeHTML(category)}" type="button">
                <span class="record-list-icon">${getCategoryIcon(category, type)}</span>
                <span><strong>${escapeHTML(category)}</strong></span>
                <b>›</b>
              </button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderSubcategorySettings(routeCategory) {
  const category = cleanName(decodeURIComponent(routeCategory || state.recordDraft.category || ""));
  const type = state.recordDraft.type;
  if (category) state.recordDraft.category = category;
  const subcategories = getCategoryChildren(type, category);

  recordSubcategorySettingsTitle.textContent = "子分类设置";
  recordSubcategorySettingsList.innerHTML = `
    <div class="record-list">
      <button class="record-list-row category-add-row" data-add-subcategory="${escapeHTML(category)}" type="button">
        <span class="record-list-icon">+</span>
        <span><strong>添加子分类</strong><small>添加到当前分类：${escapeHTML(category || "未选择")}</small></span>
        <b>›</b>
      </button>
    </div>
    <div class="record-list-section">
      <h3>已注册子分类</h3>
      <div class="record-list">
        ${subcategories
          .map(
            (subcategory) => `
              <button class="record-list-row" data-settings-subcategory="${escapeHTML(subcategory)}" type="button">
                <span class="record-list-icon">${getSubcategoryIcon(category, subcategory, type)}</span>
                <span><strong>${escapeHTML(subcategory)}</strong><small>${escapeHTML(category)}</small></span>
                <b>›</b>
              </button>
            `,
          )
          .join("") || '<p class="empty-state is-visible">还没有子分类。</p>'}
      </div>
    </div>
  `;
}

function renderRecordDetail() {
  const typeLabel = state.recordDraft.type === "income" ? "收入" : "支出";
  const date = state.recordDraft.date || detailRecordDate.value || inputRecordDate.value || state.selectedDate || todayISO();
  recordDetailTitle.textContent = state.recordDraft.type === "income" ? "收入详情" : "支出详情";
  recordDetailIcon.textContent = getSubcategoryIcon(state.recordDraft.category, state.recordDraft.subcategory, state.recordDraft.type);
  recordDetailPath.textContent = `${typeLabel} > ${state.recordDraft.category || "未选择"} > ${
    state.recordDraft.subcategory || state.recordDraft.category || "未选择"
  }`;
  recordDetailAmount.textContent = money(state.recordDraft.amount || calculateAmount(state.recordDraft.expression) || 0);
  detailRecordDate.value = date;
  detailRecordDateLabel.textContent = formatDateWithWeekday(date);
  if (!detailRecordNote.value) detailRecordNote.value = state.recordDraft.note || inputRecordNote.value || "";
}

function prepareCategoryFormRoute(route) {
  if (route.section !== "record") return;
  if (route.mode === "category" && route.param === "new") {
    state.categoryForm = { mode: "new-category", type: state.recordDraft.type, category: "", subcategory: "", icon: DEFAULT_CATEGORY_ICON };
    renderCategoryForm();
    return;
  }
  if (route.mode === "category" && route.param === "edit") {
    const category = cleanName(decodeURIComponent(route.action || ""));
    state.categoryForm = {
      mode: "edit-category",
      type: state.recordDraft.type,
      category,
      subcategory: "",
      icon: getCategoryIcon(category, state.recordDraft.type),
    };
    renderCategoryForm();
    return;
  }
  if (route.mode === "subcategory" && route.action === "new") {
    const category = cleanName(decodeURIComponent(route.param || ""));
    state.categoryForm = { mode: "new-subcategory", type: state.recordDraft.type, category, subcategory: "", icon: getCategoryIcon(category, state.recordDraft.type) };
    renderCategoryForm();
    return;
  }
  if (route.mode === "subcategory" && route.action === "edit") {
    const category = cleanName(decodeURIComponent(route.param || ""));
    const subcategory = cleanName(decodeURIComponent(route.extra || ""));
    state.categoryForm = {
      mode: "edit-subcategory",
      type: state.recordDraft.type,
      category,
      subcategory,
      icon: getSubcategoryIcon(category, subcategory, state.recordDraft.type),
    };
    renderCategoryForm();
  }
}

function renderCategoryForm() {
  const form = state.categoryForm;
  categoryFormTitle.textContent =
    form.mode === "new-category" ? "新增分类" : form.mode === "edit-category" ? "编辑分类" : form.mode === "new-subcategory" ? "新增子分类" : "编辑子分类";
  categoryFormContext.hidden = !form.mode.includes("subcategory");
  categoryFormContext.textContent = form.mode.includes("subcategory") ? `所属分类：${form.category}` : "";
  categoryFormName.disabled = form.mode.startsWith("edit");
  categoryFormName.value = form.mode.includes("subcategory") ? form.subcategory : form.category;
  categoryFormName.placeholder = form.mode.includes("subcategory") ? "子分类名称" : "分类名称";
  categoryIconGrid.innerHTML = ICON_CHOICES.map(
    (icon) => `<button class="icon-choice ${form.icon === icon ? "is-selected" : ""}" data-icon-choice="${icon}" type="button">${icon}</button>`,
  ).join("");
  if (deleteCategoryForm) {
    const canDelete = form.mode === "edit-category" || form.mode === "edit-subcategory";
    deleteCategoryForm.hidden = !canDelete;
    deleteCategoryForm.textContent = form.mode === "edit-subcategory" ? "删除子分类" : "删除分类";
  }
}

function saveCategoryFormData() {
  const form = state.categoryForm;
  const name = cleanName(categoryFormName.value);
  const icon = form.icon || DEFAULT_CATEGORY_ICON;
  const returnHash = state.categoryFormReturnHash;
  if (!name) {
    alert("名称不能为空");
    return;
  }

  if (form.mode === "new-category") {
    categoryTree[form.type] = categoryTree[form.type] || {};
    if (categoryTree[form.type]?.[name]) {
      alert("同名分类已经存在");
      return;
    }
    categoryTree[form.type][name] = { icon, children: [] };
    saveCategoryTree();
    render();
    state.categoryFormReturnHash = "";
    navigateTo(returnHash || "#record/category");
    return;
  }

  if (form.mode === "edit-category") {
    setCategoryIcon(form.type, form.category, icon);
    saveCategoryTree();
    render();
    state.categoryFormReturnHash = "";
    navigateTo(returnHash || "#record/category");
    return;
  }

  if (form.mode === "new-subcategory") {
    if (getCategoryChildren(form.type, form.category).includes(name)) {
      alert("同名子分类已经存在");
      return;
    }
    addSubcategoryNode(form.type, form.category, name, icon);
    saveCategoryTree();
    render();
    state.categoryFormReturnHash = "";
    navigateTo(returnHash || `#record/subcategory/${encodeURIComponent(form.category)}`);
    return;
  }

  if (form.mode === "edit-subcategory") {
    setSubcategoryIcon(form.type, form.category, form.subcategory, icon);
    saveCategoryTree();
    render();
    state.categoryFormReturnHash = "";
    navigateTo(returnHash || `#record/subcategory/${encodeURIComponent(form.category)}`);
  }
}

function deleteCategoryFormData() {
  const form = state.categoryForm;
  if (form.mode === "edit-category") {
    deleteCategoryFromTreePreservingEntries(form.type, form.category);
    return;
  }
  if (form.mode === "edit-subcategory") {
    deleteSubcategoryFromTreePreservingEntries(form.type, form.category, form.subcategory);
  }
}

function deleteCategoryFromTreePreservingEntries(type, category) {
  const cleanCategory = cleanName(category);
  if (!cleanCategory || !categoryTree[type]?.[cleanCategory]) return;
  if (!confirm("确定要删除这个分类吗？")) return;
  const typed = prompt("此操作不会删除历史记录，但会从分类列表中移除该分类及其子分类。请输入“删除”确认。");
  if (typed !== "删除") return;

  delete categoryTree[type][cleanCategory];
  saveCategoryTree();
  render();
  state.categoryFormReturnHash = "";
  navigateTo("#analysis/summary");
}

function deleteSubcategoryFromTreePreservingEntries(type, category, subcategory) {
  const cleanCategory = cleanName(category);
  const cleanSubcategory = cleanName(subcategory);
  const node = getCategoryNode(type, cleanCategory);
  if (!node || !cleanSubcategory) return;
  if (!node.children.some((item) => item.name === cleanSubcategory)) return;
  if (!confirm("确定要删除这个子分类吗？")) return;
  const typed = prompt("此操作不会删除历史记录，但会从分类列表中移除。请输入“删除”确认。");
  if (typed !== "删除") return;

  node.children = node.children.filter((item) => item.name !== cleanSubcategory);
  saveCategoryTree();
  render();
  const returnHash = state.categoryFormReturnHash;
  state.categoryFormReturnHash = "";
  navigateTo(returnHash || `#record/subcategory/${encodeURIComponent(cleanCategory)}`);
}

function hasEntriesForCategory(categoryName) {
  const category = cleanName(categoryName);
  return state.entries.some((entry) => entry.category === category);
}

function hasEntriesForSubcategory(categoryName, subcategoryName) {
  const category = cleanName(categoryName);
  const subcategory = cleanName(subcategoryName);
  return state.entries.some((entry) => entry.category === category && entry.subcategory === subcategory);
}

function renderRecordSimple() {
  document.querySelectorAll("[data-simple-type]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.simpleType === state.recordSimple.type);
  });

  simpleCategoryPills.innerHTML = simpleCategories
    .map(
      (category) =>
        `<button class="category-pill ${state.recordSimple.category === category.name ? "is-selected" : ""}" data-simple-category="${escapeHTML(
          category.name,
        )}" type="button">${category.icon} ${escapeHTML(category.name)}</button>`,
    )
    .join("");

  const subcategories = getCategoryChildren(state.recordSimple.type, state.recordSimple.category);
  simpleSubcategoryField.hidden = !subcategories.length;
  if (subcategories.length) {
    if (!subcategories.includes(state.recordSimple.subcategory)) state.recordSimple.subcategory = subcategories[0];
    simpleSubcategory.innerHTML = subcategories
      .map((name) => `<option value="${name}" ${name === state.recordSimple.subcategory ? "selected" : ""}>${name}</option>`)
      .join("");
  } else {
    state.recordSimple.subcategory = state.recordSimple.category;
  }

  if (!simpleDate.value) simpleDate.value = state.selectedDate || todayISO();
}

function setRecordInputType(type) {
  state.recordDraft.type = type === "income" ? "income" : "expense";
  state.recordDraft.category = "";
  state.recordDraft.subcategory = "";
  state.recordCategoryFocus = "";
  renderRecordInput();
}

function setSimpleType(type) {
  state.recordSimple.type = type === "income" ? "income" : "expense";
  if (categoryTree[state.recordSimple.type]?.[state.recordSimple.category]) {
    state.recordSimple.subcategory = getCategoryChildren(state.recordSimple.type, state.recordSimple.category)[0] || state.recordSimple.category;
  } else {
    state.recordSimple.subcategory = state.recordSimple.category;
  }
  state.recordCategoryFocus = "";
  renderRecordSimple();
}

function pushCalculatorKey(key) {
  const expression = state.recordInput.expression;
  const last = expression.slice(-1);
  const operators = ["+", "-", "×", "÷"];

  if (operators.includes(key)) {
    if (!expression || operators.includes(last) || last === ".") return;
    state.recordInput.expression += key;
  } else if (key === ".") {
    const currentNumber = expression.split(/[+\-×÷]/).pop();
    if (currentNumber.includes(".")) return;
    state.recordInput.expression += currentNumber ? "." : "0.";
  } else {
    state.recordInput.expression += key;
  }

  state.recordInput.amount = 0;
  renderRecordInput();
}

function deleteCalculatorKey() {
  state.recordInput.expression = state.recordInput.expression.slice(0, -1);
  state.recordInput.amount = 0;
  renderRecordInput();
}

function advanceRecordInput() {
  if (state.recordDraft.amount > 0 && state.recordDraft.category && state.recordDraft.subcategory) {
    navigateTo("#record/detail");
    return;
  }

  const result = state.recordDraft.amount || calculateAmount(state.recordDraft.expression);
  if (result === null) {
    alert("金额输入有误");
    return;
  }
  if (result <= 0) {
    alert("请输入金额");
    return;
  }

  state.recordDraft.amount = result;
  state.recordDraft.expression = formatPlainAmount(result);
  inputRecordDate.value = inputRecordDate.value || state.selectedDate || todayISO();
  if (!state.recordDraft.category) {
    state.recordCategoryReturn = "input";
    navigateTo("#record/category");
    return;
  }
  if (!state.recordDraft.subcategory) {
    navigateTo(`#record/subcategory/${encodeURIComponent(state.recordDraft.category)}`);
    return;
  }
  navigateTo("#record/detail");
}

function ensureRecordAmount() {
  const result = state.recordDraft.amount || calculateAmount(state.recordDraft.expression);
  if (result === null) {
    alert("金额输入有误");
    return false;
  }
  if (result <= 0) {
    alert("请输入金额");
    return false;
  }
  state.recordDraft.amount = result;
  state.recordDraft.expression = formatPlainAmount(result);
  inputRecordDate.value = inputRecordDate.value || state.selectedDate || todayISO();
  detailRecordDate.value = detailRecordDate.value || inputRecordDate.value;
  return true;
}

function handleRecordSubcategoryPick(event) {
  const addButton = event.target.closest("[data-add-subcategory-direct]");
  if (addButton) {
    const category = addButton.dataset.addSubcategoryDirect || state.recordDraft.category || "";
    state.categoryFormReturnHash = `#record/subcategory/${encodeURIComponent(category)}`;
    navigateTo(`#record/subcategory/${encodeURIComponent(category)}/new`);
    return;
  }

  const settingsButton = event.target.closest("[data-open-subcategory-settings]");
  if (settingsButton) {
    navigateTo(`#record/subcategory/${encodeURIComponent(settingsButton.dataset.openSubcategorySettings || state.recordDraft.category || "")}/settings`);
    return;
  }

  const button = event.target.closest("[data-record-subcategory-choice]");
  if (!button) return;

  state.recordDraft.category = button.dataset.recordCategoryChoice || state.recordDraft.category;
  state.recordDraft.subcategory = button.dataset.recordSubcategoryChoice || state.recordDraft.category;
  navigateTo("#record/detail");
}

function selectRecordMainCategory(category) {
  if (state.recordCategoryReturn === "simple") {
    state.recordSimple.category = category;
    const subcategories = getCategoryChildren(state.recordSimple.type, category);
    state.recordSimple.subcategory = subcategories[0] || category;
    renderRecordSimple();
    navigateTo("#record/simple");
    return;
  }

  if (!ensureRecordAmount()) return;
  state.recordDraft.category = category;
  state.recordDraft.subcategory = "";
  navigateTo(`#record/subcategory/${encodeURIComponent(category)}`);
  renderRecordInput();
}

function handleRecordCategoryPick(event) {
  const addButton = event.target.closest("[data-add-category-direct]");
  if (addButton) {
    state.categoryFormReturnHash = "#record/category";
    navigateTo("#record/category/new");
    return;
  }

  const settingsButton = event.target.closest("[data-open-category-settings]");
  if (settingsButton) {
    navigateTo("#record/category/settings");
    return;
  }

  const recentButton = event.target.closest("[data-recent-category]");
  if (recentButton) {
    if (state.recordCategoryReturn === "simple") {
      state.recordSimple.category = recentButton.dataset.recentCategory;
      state.recordSimple.subcategory = recentButton.dataset.recentSubcategory || state.recordSimple.category;
      renderRecordSimple();
      navigateTo("#record/simple");
      return;
    }
    if (!ensureRecordAmount()) return;
    state.recordDraft.category = recentButton.dataset.recentCategory;
    state.recordDraft.subcategory = recentButton.dataset.recentSubcategory || state.recordDraft.category;
    navigateTo("#record/detail");
    return;
  }

  const mainButton = event.target.closest("[data-record-main-category]");
  if (mainButton) {
    selectRecordMainCategory(mainButton.dataset.recordMainCategory);
    return;
  }
}

function handleCategorySettingsPick(event) {
  const addButton = event.target.closest("[data-add-category]");
  if (addButton) {
    state.categoryFormReturnHash = "#record/category/settings";
    navigateTo("#record/category/new");
    return;
  }

  const categoryButton = event.target.closest("[data-settings-category]");
  if (!categoryButton) return;
  state.categoryFormReturnHash = "#record/category/settings";
  navigateTo(`#record/category/edit/${encodeURIComponent(categoryButton.dataset.settingsCategory)}`);
}

function handleSubcategorySettingsPick(event) {
  const category = state.recordDraft.category || "";
  const addButton = event.target.closest("[data-add-subcategory]");
  if (addButton) {
    state.categoryFormReturnHash = `#record/subcategory/${encodeURIComponent(category)}/settings`;
    navigateTo(`#record/subcategory/${encodeURIComponent(category)}/new`);
    return;
  }

  const subcategoryButton = event.target.closest("[data-settings-subcategory]");
  if (!subcategoryButton) return;
  state.categoryFormReturnHash = `#record/subcategory/${encodeURIComponent(category)}/settings`;
  navigateTo(`#record/subcategory/${encodeURIComponent(category)}/edit/${encodeURIComponent(subcategoryButton.dataset.settingsSubcategory)}`);
}

function recentCategoryPairs(type) {
  const seen = new Set();
  return [...state.entries]
    .filter((entry) => entry.type === type && entry.category)
    .sort((a, b) => (b.updatedAt || b.createdAt || "").localeCompare(a.updatedAt || a.createdAt || ""))
    .reduce((items, entry) => {
      const subcategory = entry.subcategory || entry.category;
      const key = `${entry.category}\n${subcategory}`;
      if (seen.has(key) || items.length >= 8) return items;
      seen.add(key);
      items.push({ category: entry.category, subcategory });
      return items;
    }, []);
}

function categoryIcon(category) {
  return getCategoryIcon(category);
}

function defaultIconFor(name) {
  const value = cleanName(name).toLowerCase();
  const exactIcons = {
    房租: "🏠",
    水电: "💡",
    水电煤: "💡",
    话费网络: "📱",
    食品: "🍚",
    交通费: "🚃",
    兴趣爱好: "🎮",
    服装: "👕",
    医疗营养: "💊",
    日用消耗品: "🧴",
    年金保险: "🧾",
    简餐饮料: "🧋",
    学习用品: "📚",
    大型家具: "🛋️",
    机票船票: "✈️",
    油费: "🚗",
    人情往来: "🎁",
    工作相关: "💼",
    银行: "🏦",
    其他: "📦",
  };
  if (exactIcons[name]) return exactIcons[name];

  const rules = [
    { icon: "🏠", keywords: ["房租", "家租", "租金", "管理费", "押金", "礼金", "中介费", "住宅", "宿舍", "钥匙", "保险", "住宅保险"] },
    { icon: "🛋️", keywords: ["家具", "床", "桌", "椅", "沙发", "家电", "大型家具"] },
    { icon: "💡", keywords: ["水", "电", "水电", "煤气", "gas", "ガス", "燃气", "水电煤"] },
    { icon: "📱", keywords: ["话费", "手机", "通信", "网络", "网费", "povo", "ahamo", "乐天", "wifi", "话费网络"] },
    { icon: "🍞", keywords: ["早餐"] },
    { icon: "🍱", keywords: ["午餐", "午饭"] },
    { icon: "🍜", keywords: ["晚餐", "晚饭", "夜宵"] },
    { icon: "🧋", keywords: ["饮料", "奶茶", "咖啡", "茶", "简餐饮料"] },
    { icon: "🍽️", keywords: ["外食", "外餐", "餐饮", "饭店", "餐厅"] },
    { icon: "🏪", keywords: ["便利店"] },
    { icon: "🍚", keywords: ["食品", "食材", "原料", "超市", "买菜"] },
    { icon: "🚃", keywords: ["交通", "交通费", "电车", "地铁", "公交", "巴士"] },
    { icon: "🚲", keywords: ["自行车", "单车"] },
    { icon: "🚕", keywords: ["打车", "出租车", "taxi"] },
    { icon: "🚗", keywords: ["油费", "汽油", "停车", "车"] },
    { icon: "✈️", keywords: ["机票", "飞机", "船票", "旅行", "机票船票"] },
    { icon: "🛍️", keywords: ["购物", "买东西"] },
    { icon: "🧴", keywords: ["日用", "生活用品", "消耗品", "洗衣", "洗发", "纸巾", "口罩", "电池", "手套", "鞋除", "日用消耗品"] },
    { icon: "🍪", keywords: ["零食"] },
    { icon: "📚", keywords: ["学习", "学习用品", "书", "书籍", "参考书", "报纸", "考试", "受验料", "学费", "塾"] },
    { icon: "💼", keywords: ["工作", "工作相关", "打工", "アルバイト", "制服", "笔", "工具", "安全帽", "头盔"] },
    { icon: "🩺", keywords: ["牙", "眼镜", "体检"] },
    { icon: "💊", keywords: ["医疗", "医院", "药", "药品", "看病", "营养", "保健", "维生素", "蛋白粉", "医疗营养"] },
    { icon: "💻", keywords: ["chatbox", "ai", "软件", "工具"] },
    { icon: "🎮", keywords: ["兴趣", "兴趣爱好", "娱乐", "游戏", "电影", "订阅", "音乐", "香水", "摄影"] },
    { icon: "👕", keywords: ["服装", "衣服", "鞋", "帽子"] },
    { icon: "✂️", keywords: ["理发", "剪发", "美容", "护肤"] },
    { icon: "🏦", keywords: ["银行", "手续费", "取款", "转账"] },
    { icon: "🧾", keywords: ["年金", "保险", "税", "所得税", "住民税", "pension", "年金保险"] },
    { icon: "💴", keywords: ["收入", "工资", "兼职", "奖金", "退款"] },
    { icon: "🎁", keywords: ["人情", "礼物", "礼金", "祝仪", "香典", "聚会", "飲み会", "饮み会", "人情往来"] },
    { icon: "📦", keywords: ["其他", "杂项", "未分类"] },
  ];
  return rules.find((rule) => rule.keywords.some((keyword) => value.includes(keyword.toLowerCase())))?.icon || DEFAULT_CATEGORY_ICON;
}

function shouldUseSmartIcon(icon) {
  const value = String(icon || "").trim();
  return !value || value === DEFAULT_CATEGORY_ICON || value === "📁";
}

function smartIcon(name, icon) {
  return shouldUseSmartIcon(icon) ? defaultIconFor(name) : icon;
}

function normalizeCategoryNode(name, value) {
  if (Array.isArray(value)) {
    return { icon: defaultIconFor(name), children: value.map((child) => normalizeSubcategoryNode(child)) };
  }
  if (value && typeof value === "object") {
    const children = Array.isArray(value.children) ? value.children : Array.isArray(value.subcategories) ? value.subcategories : [];
    return { icon: smartIcon(name, value.icon), children: children.map((child) => normalizeSubcategoryNode(child)) };
  }
  return { icon: defaultIconFor(name), children: [] };
}

function normalizeSubcategoryNode(value) {
  if (value && typeof value === "object") {
    const name = cleanName(value.name);
    return { name, icon: smartIcon(name, value.icon) };
  }
  const name = cleanName(value);
  return { name, icon: defaultIconFor(name) };
}

function getCategoryNode(type, category) {
  const value = categoryTree[type]?.[category];
  if (!value) return null;
  const node = normalizeCategoryNode(category, value);
  categoryTree[type][category] = node;
  return node;
}

function getCategoryChildren(type, category) {
  const node = getCategoryNode(type, category);
  return node ? node.children.map((child) => child.name).filter(Boolean) : [];
}

function getCategoryIcon(category, type = "") {
  const types = type ? [type] : ["expense", "income"];
  for (const itemType of types) {
    const node = getCategoryNode(itemType, category);
    if (node?.icon) return node.icon;
  }
  return defaultIconFor(category);
}

function getSubcategoryIcon(category, subcategory, type = "") {
  const types = type ? [type] : ["expense", "income"];
  for (const itemType of types) {
    const node = getCategoryNode(itemType, category);
    const child = node?.children.find((item) => item.name === subcategory);
    if (child?.icon) return child.icon;
    if (node?.icon) return node.icon;
  }
  return getCategoryIcon(category, type);
}

function setCategoryIcon(type, category, icon) {
  const node = getCategoryNode(type, category);
  if (node) node.icon = icon || defaultIconFor(category);
}

function addSubcategoryNode(type, category, name, icon) {
  const node = getCategoryNode(type, category);
  if (!node) return;
  if (node.children.some((item) => item.name === name)) return;
  node.children.push({ name, icon: icon || defaultIconFor(name) });
}

function setSubcategoryIcon(type, category, subcategory, icon) {
  const node = getCategoryNode(type, category);
  if (!node) return;
  const child = node.children.find((item) => item.name === subcategory);
  if (child) child.icon = icon || defaultIconFor(subcategory);
}

function saveRecordInput() {
  const amount = state.recordDraft.amount || calculateAmount(state.recordDraft.expression);
  if (!amount || amount <= 0) {
    alert("请输入金额");
    return;
  }
  if (!state.recordDraft.category || !state.recordDraft.subcategory) {
    navigateTo("#record/category");
    return;
  }
  const date = state.recordDraft.date || detailRecordDate.value;
  if (!validDate(date)) {
    alert("请选择日期");
    return;
  }

  const record = saveEntryFromData({
    type: state.recordDraft.type,
    amount,
    category: state.recordDraft.category,
    subcategory: state.recordDraft.subcategory,
    date,
    note: detailRecordNote.value.trim(),
  });

  state.recordDraft.expression = "";
  state.recordDraft.amount = 0;
  state.recordDraft.category = "";
  state.recordDraft.subcategory = "";
  state.recordDraft.date = "";
  state.recordDraft.note = "";
  inputRecordNote.value = "";
  detailRecordNote.value = "";
  render();
  showToast("已记录");
  navigateTo(`#history/day/${record.date}`);
}

function handleSimpleCategoryPick(event) {
  const button = event.target.closest("[data-simple-category]");
  if (!button) return;

  state.recordSimple.category = button.dataset.simpleCategory;
  const subcategories = getCategoryChildren(state.recordSimple.type, state.recordSimple.category);
  state.recordSimple.subcategory = subcategories[0] || state.recordSimple.category;
  renderRecordSimple();
}

function saveRecordSimple() {
  const amount = Number(simpleAmount.value);
  const date = simpleDate.value;
  const category = state.recordSimple.category;

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("请输入金额");
    return;
  }
  if (!date) {
    alert("请选择日期");
    return;
  }
  if (!category) {
    alert("请选择分类");
    return;
  }

  const record = saveEntryFromData({
    type: state.recordSimple.type,
    amount,
    category,
    subcategory: state.recordSimple.subcategory || category,
    date,
    note: simpleNote.value.trim(),
  });

  simpleAmount.value = "";
  simpleNote.value = "";
  render();
  showToast("已记录");
  navigateTo(`#history/day/${record.date}`);
}

function calculateAmount(expression) {
  const source = String(expression || "").replace(/×/g, "*").replace(/÷/g, "/");
  if (!source || /[+\-*/.]$/.test(source) || !/^[\d+\-*/.]+$/.test(source)) return null;

  const tokens = source.match(/\d+(?:\.\d+)?|[+\-*/]/g);
  if (!tokens || tokens.join("") !== source) return null;

  const values = [];
  const operators = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

  const applyOperator = () => {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();
    if (!Number.isFinite(left) || !Number.isFinite(right)) throw new Error("Invalid expression");
    if (operator === "+") values.push(left + right);
    if (operator === "-") values.push(left - right);
    if (operator === "*") values.push(left * right);
    if (operator === "/") {
      if (right === 0) throw new Error("Invalid expression");
      values.push(left / right);
    }
  };

  try {
    tokens.forEach((token, index) => {
      if (/^\d/.test(token)) {
        values.push(Number(token));
        return;
      }
      if (index === 0 || /[+\-*/]/.test(tokens[index - 1])) throw new Error("Invalid expression");
      while (operators.length && precedence[operators[operators.length - 1]] >= precedence[token]) {
        applyOperator();
      }
      operators.push(token);
    });
    while (operators.length) applyOperator();
  } catch {
    return null;
  }

  const result = values[0];
  return Number.isFinite(result) ? Math.round(result * 100) / 100 : null;
}

function formatPlainAmount(value) {
  return String(Math.round(Number(value) * 100) / 100);
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 1600);
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
  const month = currentMonth();
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(month));
  const expenseEntries = monthEntries.filter((entry) => entry.type === "expense");
  const income = sum(monthEntries.filter((entry) => entry.type === "income"));
  const expense = sum(expenseEntries);
  const todayExpense = sum(state.entries.filter((entry) => entry.date === todayISO() && entry.type === "expense"));
  const foodExpense = sumCategoryLike(expenseEntries, ["食品", "餐饮", "简餐饮料"]);
  const trafficExpense = sumCategoryLike(expenseEntries, ["交通费", "交通"]);
  const budget = getMonthBudget(month);
  const remaining = budget > 0 ? budget - expense : null;
  const grouped = groupExpenseByCategory(expenseEntries);

  renderProfile();
  homeToday.textContent = formatDateWithWeekday(todayISO());
  monthIncome.textContent = money(income);
  monthExpense.textContent = money(expense);
  monthBalance.textContent = money(income - expense);
  homeMonthExpenseCenter.textContent = money(expense);
  homeTodayExpense.textContent = money(todayExpense);
  homeFoodExpense.textContent = money(foodExpense);
  homeTrafficExpense.textContent = money(trafficExpense);
  homeBudgetRemaining.textContent = remaining === null ? "未设置" : money(remaining);
  homeBudgetRemaining.classList.toggle("expense", remaining !== null && remaining < 0);
  renderDonutChartToCanvas(homeDonut, grouped, expense, 18);

  const recentEntries = [...state.entries]
    .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  homeRecentList.innerHTML =
    recentEntries.map(renderEntryCard).join("") || '<p class="empty-state is-visible">还没有记录，先添加今天的第一笔吧。</p>';
}

function renderProfile() {
  homeCover.style.backgroundImage = state.profile.cover ? `url("${state.profile.cover}")` : "";
  homeAvatar.style.backgroundImage = state.profile.avatar ? `url("${state.profile.avatar}")` : "";
  homeAvatar.textContent = state.profile.avatar ? "" : "记";
}

function loadProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return { avatar: "", cover: "" };
  try {
    const parsed = JSON.parse(raw);
    return { avatar: parsed.avatar || "", cover: parsed.cover || "" };
  } catch {
    return { avatar: "", cover: "" };
  }
}

function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(state.profile));
}

function handleProfileImage(event, field) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert("图片太大，请选择 2MB 以下图片");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    state.profile[field] = String(reader.result || "");
    saveProfile();
    renderProfile();
    event.target.value = "";
  });
  reader.readAsDataURL(file);
}

function sumCategoryLike(entries, names) {
  return sum(entries.filter((entry) => names.some((name) => entry.category === name || entry.subcategory === name)));
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

function renderAnalysis() {
  const month = state.analysisMonth;
  const monthEntries = state.entries.filter((entry) => entry.date.startsWith(month));
  const expenseEntries = monthEntries.filter((entry) => entry.type === "expense");
  const incomeEntries = monthEntries.filter((entry) => entry.type === "income");
  const expense = sum(expenseEntries);
  const income = sum(incomeEntries);
  const grouped = groupExpenseByCategory(expenseEntries);
  const range = formatAnalysisRange(month);

  [analysisSummaryRange, analysisBudgetRange, analysisSettingsRange].forEach((node) => {
    if (node) node.textContent = range;
  });

  summaryIncome.textContent = money(income);
  summaryExpense.textContent = money(expense);
  summaryBalance.textContent = money(income - expense);
  summaryExpenseCenter.textContent = money(expense);
  renderDonutChart(grouped, expense);
  renderAnalysisCategoryList(grouped, expense);
  renderAnalysisCategoryDetail();
  renderBudget(expense, grouped);
  renderBudgetSettings();
}

function groupExpenseByCategory(expenseEntries) {
  return expenseEntries.reduce((result, entry) => {
    const category = entry.category || "其他";
    result[category] = result[category] || { amount: 0, count: 0 };
    result[category].amount += entry.amount;
    result[category].count += 1;
    return result;
  }, {});
}

function groupExpenseBySubcategory(expenseEntries) {
  return expenseEntries.reduce((result, entry) => {
    const subcategory = entry.subcategory || "未分类";
    result[subcategory] = result[subcategory] || { amount: 0, count: 0 };
    result[subcategory].amount += entry.amount;
    result[subcategory].count += 1;
    return result;
  }, {});
}

function renderDonutChart(grouped, total) {
  renderDonutChartToCanvas(summaryDonut, grouped, total, 28);
}

function renderDonutChartToCanvas(canvas, grouped, total, lineWidth = 28) {
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const { width, height } = canvas;
  const center = width / 2;
  const radius = Math.min(width, height) / 2 - 18;
  const colors = ["#13965f", "#2f67b1", "#a56b12", "#c5483e", "#6f7a73", "#7a5cff", "#13a8a8", "#d86b38"];

  context.clearRect(0, 0, width, height);
  context.lineWidth = lineWidth;
  context.lineCap = "round";

  if (!total) {
    context.beginPath();
    context.strokeStyle = "#e4e8df";
    context.arc(center, center, radius, 0, Math.PI * 2);
    context.stroke();
    return;
  }

  let start = -Math.PI / 2;
  Object.entries(grouped)
    .sort((a, b) => b[1].amount - a[1].amount)
    .forEach(([, data], index) => {
      const angle = (data.amount / total) * Math.PI * 2;
      context.beginPath();
      context.strokeStyle = colors[index % colors.length];
      context.arc(center, center, radius, start, start + angle);
      context.stroke();
      start += angle;
    });
}

function renderAnalysisCategoryList(grouped, total) {
  const registeredCategories = Object.keys(categoryTree.expense || {});
  const categories = [...new Set([...registeredCategories, ...Object.keys(grouped)])];
  categoryList.innerHTML =
    categories
      .sort((a, b) => (grouped[b]?.amount || 0) - (grouped[a]?.amount || 0) || a.localeCompare(b, "zh-Hans-CN"))
      .map((category) => {
        const data = grouped[category] || { amount: 0, count: 0 };
        const percent = total ? Math.round((data.amount / total) * 100) : 0;
        return `
          <button class="analysis-category-row is-clickable" data-analysis-category="${escapeHTML(category)}" type="button">
            <span class="record-list-icon">${getCategoryIcon(category, "expense")}</span>
            <div>
              <strong>${escapeHTML(category)}</strong>
              <span>${data.count || 0} 笔 · ${percent}%</span>
            </div>
            <strong>${money(data.amount)}</strong>
            <span class="row-arrow" aria-hidden="true">›</span>
          </button>
        `;
      })
      .join("") +
    `
      <button class="analysis-category-row category-add-row is-clickable" data-analysis-add-category type="button">
        <span class="record-list-icon">＋</span>
        <div>
          <strong>新增大类</strong>
          <span>管理记账分类</span>
        </div>
        <span class="row-arrow" aria-hidden="true">›</span>
      </button>
    `;
}

function renderAnalysisCategoryDetail() {
  if (!analysisSubcategoryList) return;
  const route = parseRoute();
  if (route.section !== "analysis" || route.mode !== "category") return;

  const category = cleanName(decodeURIComponent(route.param || ""));
  const month = state.analysisMonth;
  const monthEntries = state.entries.filter(
    (entry) => entry.type === "expense" && entry.date.startsWith(month) && (entry.category || "其他") === category,
  );
  const grouped = groupExpenseBySubcategory(monthEntries);
  const total = sum(monthEntries);
  const registeredSubcategories = getCategoryChildren("expense", category);
  const subcategories = [...new Set([...registeredSubcategories, ...Object.keys(grouped)])];

  analysisCategoryTitle.textContent = category || "分类";
  analysisCategoryRange.textContent = formatAnalysisRange(month);
  analysisCategoryCenterLabel.textContent = category || "分类支出";
  analysisCategoryCenter.textContent = money(total);
  analysisCategoryTotalName.textContent = `${category || "分类"}整体`;
  analysisCategoryTotalAmount.textContent = money(total);
  analysisCategoryEdit.dataset.category = category;
  renderDonutChartToCanvas(analysisCategoryDonut, grouped, total, 28);

  analysisSubcategoryList.innerHTML =
    subcategories
      .sort((a, b) => (grouped[b]?.amount || 0) - (grouped[a]?.amount || 0) || a.localeCompare(b, "zh-Hans-CN"))
      .map((subcategory) => {
        const data = grouped[subcategory] || { amount: 0, count: 0 };
        const isRegistered = registeredSubcategories.includes(subcategory);
        const icon = isRegistered ? getSubcategoryIcon(category, subcategory, "expense") : defaultIconFor(subcategory);
        return `
          <div class="analysis-category-row">
            <span class="record-list-icon">${icon}</span>
            <div>
              <strong>${escapeHTML(subcategory)}</strong>
              <span>${data.count || 0} 笔${isRegistered ? "" : " · 未注册项目"}</span>
            </div>
            <strong>${money(data.amount)}</strong>
            ${
              isRegistered
                ? `<button class="text-button" data-analysis-edit-subcategory="${escapeHTML(subcategory)}" type="button">编辑</button>`
                : `<span class="row-arrow" aria-hidden="true">›</span>`
            }
          </div>
        `;
      })
      .join("") +
    `
      <button class="analysis-category-row category-add-row is-clickable" data-analysis-add-subcategory="${escapeHTML(category)}" type="button">
        <span class="record-list-icon">＋</span>
        <div>
          <strong>新增子分类</strong>
          <span>${escapeHTML(category)}</span>
        </div>
        <span class="row-arrow" aria-hidden="true">›</span>
      </button>
    `;
}

function renderEntryCard(entry) {
  const icon = getSubcategoryIcon(entry.category, entry.subcategory, entry.type);
  return `
    <article class="entry-card ${entry.type}" data-open-edit="${entry.id}">
      <div class="entry-icon">${icon}</div>
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
  if (!document.querySelector("#categoryList")) return;
  const expenseEntries = monthEntries.filter((entry) => entry.type === "expense");
  const total = sum(expenseEntries);
  const grouped = expenseEntries.reduce((result, entry) => {
    const key = entry.category || "其他";
    result[key] = result[key] || { amount: 0, count: 0 };
    result[key].amount += entry.amount;
    result[key].count += 1;
    return result;
  }, {});

  const categoryTotal = document.querySelector("#categoryTotal");
  if (categoryTotal) categoryTotal.textContent = money(total);
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

function renderBudget(currentExpense, grouped = null) {
  const month = state.analysisMonth;
  const expense =
    currentExpense ?? sum(state.entries.filter((entry) => entry.date.startsWith(month) && entry.type === "expense"));
  const expenseByCategory = grouped || groupExpenseByCategory(state.entries.filter((entry) => entry.date.startsWith(month) && entry.type === "expense"));
  const monthBudget = getMonthBudget(month);
  const percent = monthBudget > 0 ? Math.min(100, Math.round((expense / monthBudget) * 100)) : 0;
  const remaining = monthBudget - expense;
  const progress = document.querySelector("#budgetProgress");

  state.budget = monthBudget;
  budgetInput.value = monthBudget || "";
  budgetMonthTotal.textContent = money(monthBudget);
  budgetMonthExpense.textContent = money(expense);
  budgetMonthRemaining.textContent = money(remaining);
  budgetMonthRemaining.classList.toggle("expense", remaining < 0);
  if (progress) {
    progress.style.width = `${percent}%`;
    progress.style.background = percent >= 100 ? "var(--red)" : percent >= 80 ? "var(--gold)" : "var(--green)";
  }

  document.querySelector("#budgetText").textContent =
    monthBudget > 0
      ? `本月已支出 ${money(expense)}，占预算 ${percent}%，剩余 ${money(Math.max(0, remaining))}。`
      : "设置月预算后，会显示本月支出进度。";

  const categories = [...new Set([...Object.keys(expenseByCategory), ...Object.keys(getMonthBudgetConfig(month).categoryBudgets)])];
  categoryBudgetList.innerHTML =
    categories
      .sort((a, b) => (expenseByCategory[b]?.amount || 0) - (expenseByCategory[a]?.amount || 0))
      .map((category) => {
        const spent = expenseByCategory[category]?.amount || 0;
        const budget = getCategoryBudget(month, category);
        const remain = budget - spent;
        const categoryPercent = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
        const over = budget > 0 && spent > budget;
        return `
          <div class="category-budget-row ${over ? "is-over" : ""}">
            <div class="category-budget-head">
              <strong><span class="inline-category-icon">${getCategoryIcon(category, "expense")}</span>${escapeHTML(category)}</strong>
              <span>已支出 ${money(spent)} / 预算 ${money(budget)}</span>
            </div>
            <div class="budget-bar"><span style="width:${categoryPercent}%; background:${over ? "var(--red)" : "var(--green)"}"></span></div>
            <small>${over ? "超支" : "剩余"} ${money(Math.abs(remain))}</small>
          </div>
        `;
      })
      .join("") || '<p class="empty-state is-visible">还没有分类预算或支出。</p>';
}

function renderBudgetSettings() {
  const config = getMonthBudgetConfig(state.analysisMonth);
  budgetInput.value = getMonthBudget(state.analysisMonth) || "";
  const expenseCategories = Object.keys(categoryTree.expense || {});
  categoryBudgetSettings.innerHTML = expenseCategories
    .map(
      (category) => `
        <label class="category-budget-input">
          <span class="category-budget-label">
            <span class="inline-category-icon">${getCategoryIcon(category, "expense") || defaultIconFor(category)}</span>
            <span>${escapeHTML(category)}</span>
          </span>
          <input data-category-budget="${escapeHTML(category)}" type="number" min="0" step="500" value="${
            config.categoryBudgets[category] || ""
          }" placeholder="0" />
        </label>
      `,
    )
    .join("");
}

function loadBudgets() {
  const legacyBudget = Number(localStorage.getItem(BUDGET_KEY) || 0);
  const fallback = { defaultMonthBudget: legacyBudget > 0 ? legacyBudget : 0, months: {} };
  const raw = localStorage.getItem(BUDGETS_KEY);
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return {
      defaultMonthBudget: Number(parsed.defaultMonthBudget || legacyBudget || 0),
      months: parsed.months && typeof parsed.months === "object" ? parsed.months : {},
    };
  } catch {
    return fallback;
  }
}

function sanitizeBudgets(value) {
  const legacyBudget = Number(localStorage.getItem(BUDGET_KEY) || 0);
  const budgets = { defaultMonthBudget: Number(value?.defaultMonthBudget || legacyBudget || 0), months: {} };
  if (!value?.months || typeof value.months !== "object") return budgets;

  Object.entries(value.months).forEach(([month, config]) => {
    if (!/^\d{4}-\d{2}$/.test(month) || !config || typeof config !== "object") return;
    const categoryBudgets = {};
    Object.entries(config.categoryBudgets || {}).forEach(([category, amount]) => {
      const cleanCategory = cleanName(category);
      const budget = Number(amount || 0);
      if (cleanCategory && budget > 0) categoryBudgets[cleanCategory] = budget;
    });
    budgets.months[month] = { monthBudget: Number(config.monthBudget || 0), categoryBudgets };
  });
  return budgets;
}

function saveBudgets() {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(state.budgets));
}

function getMonthBudgetConfig(month) {
  state.budgets.months[month] = state.budgets.months[month] || { monthBudget: 0, categoryBudgets: {} };
  state.budgets.months[month].categoryBudgets = state.budgets.months[month].categoryBudgets || {};
  return state.budgets.months[month];
}

function getMonthBudget(month) {
  const config = getMonthBudgetConfig(month);
  return Number(config.monthBudget || state.budgets.defaultMonthBudget || 0);
}

function setMonthBudget(month, budget) {
  const config = getMonthBudgetConfig(month);
  config.monthBudget = Number(budget || 0);
  if (!state.budgets.defaultMonthBudget) state.budgets.defaultMonthBudget = Number(budget || 0);
}

function getCategoryBudget(month, category) {
  return Number(getMonthBudgetConfig(month).categoryBudgets[category] || 0);
}

function setCategoryBudget(month, category, budget) {
  const config = getMonthBudgetConfig(month);
  const value = Number(budget || 0);
  if (value > 0) {
    config.categoryBudgets[category] = value;
  } else {
    delete config.categoryBudgets[category];
  }
}

function shiftAnalysisMonth(offset) {
  const [year, month] = state.analysisMonth.split("-").map(Number);
  const next = new Date(year, month - 1 + offset, 1);
  state.analysisMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  renderAnalysis();
}

function handleAnalysisCategoryAction(event) {
  const addButton = event.target.closest("[data-analysis-add-category]");
  if (addButton) {
    state.recordDraft.type = "expense";
    state.categoryFormReturnHash = "#analysis/summary";
    navigateTo("#record/category/new");
    return;
  }

  const categoryButton = event.target.closest("[data-analysis-category]");
  if (!categoryButton) return;
  navigateTo(`#analysis/category/${encodeURIComponent(categoryButton.dataset.analysisCategory)}`);
}

function handleAnalysisSubcategoryAction(event) {
  const addButton = event.target.closest("[data-analysis-add-subcategory]");
  if (addButton) {
    const category = addButton.dataset.analysisAddSubcategory || "";
    state.recordDraft.type = "expense";
    state.recordDraft.category = category;
    state.categoryFormReturnHash = `#analysis/category/${encodeURIComponent(category)}`;
    navigateTo(`#record/subcategory/${encodeURIComponent(category)}/new`);
    return;
  }

  const editButton = event.target.closest("[data-analysis-edit-subcategory]");
  if (!editButton) return;
  const route = parseRoute();
  const category = cleanName(decodeURIComponent(route.param || ""));
  const subcategory = editButton.dataset.analysisEditSubcategory || "";
  state.recordDraft.type = "expense";
  state.recordDraft.category = category;
  state.categoryFormReturnHash = `#analysis/category/${encodeURIComponent(category)}`;
  navigateTo(`#record/subcategory/${encodeURIComponent(category)}/edit/${encodeURIComponent(subcategory)}`);
}

function formatAnalysisRange(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return `${monthNumber}月1日 ～ ${lastDay}日`;
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
  const treeCategoryNames = Object.keys(tree);
  const categoryNames =
    selectedCategory && !treeCategoryNames.includes(selectedCategory) ? [selectedCategory, ...treeCategoryNames] : treeCategoryNames;
  const category = categoryNames.includes(selectedCategory) ? selectedCategory : categoryNames[0];
  categorySelect.innerHTML = categoryNames
    .map((name) => `<option value="${name}" ${name === category ? "selected" : ""}>${name}</option>`)
    .join("") + `<option value="${ADD_CATEGORY_VALUE}">+ 新增分类</option>`;
  updateSubcategoryOptions(type, category, selectedSubcategory);
}

function updateSubcategoryOptions(type, category, selectedSubcategory = "") {
  const baseOptions = getCategoryChildren(type, category);
  if (!baseOptions.length) baseOptions.push(category || "其他");
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

  categoryTree[type][name] = { icon: defaultIconFor(name), children: [{ name: "其他", icon: defaultIconFor("其他") }] };
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

  if (getCategoryChildren(type, category).includes(name)) {
    alert("这个小分类已经存在。");
    updateSubcategoryOptions(type, category, name);
    return;
  }

  addSubcategoryNode(type, category, name, defaultIconFor(name));
  saveCategoryTree();
  updateSubcategoryOptions(type, category, name);
}

function renameSubcategory(type, category, oldName) {
  if (!canManageSubcategory(type, category, oldName)) return;

  const newName = cleanName(prompt("请输入新的小分类名称：", oldName));
  if (!newName || newName === oldName) return;
  if (getCategoryChildren(type, category).includes(newName)) {
    alert("这个小分类已经存在。");
    return;
  }

  const node = getCategoryNode(type, category);
  if (node) {
    node.children = node.children.map((item) => (item.name === oldName ? { ...item, name: newName, icon: item.icon || defaultIconFor(newName) } : item));
  }
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

  const options = getCategoryChildren(type, category);
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

  const node = getCategoryNode(type, category);
  if (node) node.children = node.children.filter((item) => item.name !== subcategory);
  state.entries = state.entries.map((entry) =>
    entry.type === type && entry.category === category && entry.subcategory === subcategory
      ? { ...entry, subcategory: "未分类", updatedAt: new Date().toISOString() }
      : entry,
  );

  saveCategoryTree();
  saveEntries();
  updateSubcategoryOptions(type, category, getCategoryChildren(type, category)[0]);
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
  if (!subcategory || subcategory === ADD_SUBCATEGORY_VALUE || !getCategoryChildren(type, category).includes(subcategory)) {
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
  categoryTree[type] = categoryTree[type] || {};
  if (!categoryTree[type].其他) {
    const fallback = type === "income" ? "其他收入" : "其他";
    categoryTree[type].其他 = { icon: defaultIconFor("其他"), children: [{ name: fallback, icon: defaultIconFor(fallback) }] };
  }
}

function loadCategoryTree() {
  const raw = localStorage.getItem(CATEGORY_KEY);
  if (!raw) return sanitizeCategoryTree(defaultCategoryTree);

  try {
    return sanitizeCategoryTree(JSON.parse(raw));
  } catch {
    return sanitizeCategoryTree(defaultCategoryTree);
  }
}

function saveCategoryTree() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categoryTree));
}

function sanitizeCategoryTree(customTree) {
  const merged = { expense: {}, income: {} };
  ["expense", "income"].forEach((type) => {
    const source = customTree?.[type] && typeof customTree[type] === "object" ? customTree[type] : defaultCategoryTree[type];
    if (!source || typeof source !== "object") {
      merged[type] = {};
      return;
    }

    Object.entries(source).forEach(([category, value]) => {
      const cleanCategory = cleanName(category);
      if (!cleanCategory) return;
      const node = normalizeCategoryNode(cleanCategory, value);
      const seen = new Set();
      node.children = node.children.filter((child) => {
        if (!child.name || seen.has(child.name)) return false;
        seen.add(child.name);
        return true;
      });
      merged[type][cleanCategory] = node;
    });

    if (!Object.keys(merged[type]).length) {
      Object.entries(defaultCategoryTree[type]).forEach(([category, value]) => {
        merged[type][category] = normalizeCategoryNode(category, value);
      });
    }
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
  if (cleanCategory) return cleanCategory;
  return categoryTree[type]?.其他 ? "其他" : Object.keys(categoryTree[type])[0];
}

function normalizeSubcategory(type, category, subcategory) {
  const options = getCategoryChildren(type, category);
  if (options.includes(subcategory)) return subcategory;
  const cleanSubcategory = cleanName(subcategory) || "未分类";
  if (categoryTree[type]?.[category] && !getCategoryChildren(type, category).includes(cleanSubcategory)) {
    addSubcategoryNode(type, category, cleanSubcategory, defaultIconFor(cleanSubcategory));
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

function formatDateWithWeekday(date) {
  if (!validDate(date)) return "";
  const weekday = ["日", "月", "火", "水", "木", "金", "土"][new Date(`${date}T00:00:00`).getDay()];
  const [year, month, day] = date.split("-");
  return `${year}年${Number(month)}月${Number(day)}日（${weekday}）`;
}

function compactMoney(value) {
  if (value >= 10000) return `¥${Math.round(value / 1000) / 10}万`;
  return `¥${Math.round(value).toLocaleString("ja-JP")}`;
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
  const amount = Number(value || 0);
  const hasFraction = Math.abs(amount % 1) > 0.000001;
  const absolute = Math.abs(amount);
  const formatted = absolute.toLocaleString("ja-JP", {
    minimumFractionDigits: hasFraction ? 0 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  });
  return `${amount < 0 ? "-" : ""}¥${formatted}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((error) => console.warn("Service Worker registration failed:", error));
  });
}
