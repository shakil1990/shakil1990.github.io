"use strict";

const GITHUB_USER = "shakil1990";
const API_BASE = "https://api.github.com";
const CACHE_KEY = "portfolio-github-cache-v1";
const CACHE_TTL_MS = 10 * 60 * 1000;

const elements = {
  grid: document.getElementById("project-grid"),
  status: document.getElementById("status"),
  skills: document.getElementById("skill-list"),
  filters: document.querySelector(".filters"),
  statRepos: document.getElementById("stat-repos"),
  statLangs: document.getElementById("stat-langs"),
  statSince: document.getElementById("stat-since"),
  themeToggle: document.getElementById("theme-toggle"),
  year: document.getElementById("year"),
};

let repositories = [];
let activeFilter = "all";

function readCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < CACHE_TTL_MS) {
      return cached.data;
    }
  } catch {
    // Storage unavailable or corrupt; fall through to a network fetch.
  }
  return null;
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Caching is a convenience only.
  }
}

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`);
  }
  return response.json();
}

async function loadGitHubData() {
  const cached = readCache();
  if (cached) {
    return cached;
  }
  const [user, repos] = await Promise.all([
    fetchJson(`/users/${GITHUB_USER}`),
    fetchJson(`/users/${GITHUB_USER}/repos?per_page=100&sort=updated`),
  ]);
  const data = { user, repos };
  writeCache(data);
  return data;
}

function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createCard(repo) {
  const card = createElement("article", "card");

  const title = createElement("h3");
  const link = createElement("a", "", repo.name);
  link.href = repo.html_url;
  link.rel = "noopener";
  title.append(link);
  if (repo.fork) title.append(" ", createElement("span", "badge", "fork"));

  const description = createElement("p", "", repo.description || "No description provided.");

  const meta = createElement("div", "meta");
  if (repo.language) meta.append(createElement("span", "", repo.language));
  meta.append(createElement("span", "", `★ ${repo.stargazers_count}`));
  meta.append(createElement("span", "", `Updated ${new Date(repo.pushed_at).toLocaleDateString()}`));

  card.append(title, description, meta);
  return card;
}

function matchesFilter(repo) {
  if (activeFilter === "own") return !repo.fork;
  if (activeFilter === "fork") return repo.fork;
  return true;
}

function renderProjects() {
  const visible = repositories.filter(matchesFilter);
  elements.grid.replaceChildren(...visible.map(createCard));
  elements.status.textContent = visible.length ? "" : "No projects match this filter.";
}

function renderSkills(repos) {
  const languages = [...new Set(repos.map((repo) => repo.language).filter(Boolean))];
  elements.skills.replaceChildren(
    ...languages.map((language) => createElement("li", "chip", language))
  );
  return languages.length;
}

function renderStats(user, languageCount) {
  elements.statRepos.textContent = user.public_repos;
  elements.statLangs.textContent = languageCount;
  elements.statSince.textContent = new Date(user.created_at).getFullYear();
}

async function init() {
  elements.year.textContent = new Date().getFullYear();
  try {
    const { user, repos } = await loadGitHubData();
    repositories = repos;
    renderStats(user, renderSkills(repos));
    renderProjects();
  } catch (error) {
    elements.status.textContent =
      "Could not load projects right now. Please see my GitHub profile directly.";
    console.error(error);
  }
}

elements.filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  elements.filters.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === button));
  renderProjects();
});

elements.themeToggle.addEventListener("click", () => {
  const root = document.documentElement;
  const isDark =
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = isDark ? "light" : "dark";
});

init();
