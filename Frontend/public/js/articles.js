document.addEventListener("DOMContentLoaded", function () {
  setupArticlesPage();
});

// Setup articles page functionality
function setupArticlesPage() {
  const urlPath = window.location.pathname;

  // Articles list page
  if (urlPath === "/articles" || urlPath === "/articles/") {
    loadArticles();
    setupArticleFilters();
  }

  // Single article page
  else if (urlPath.match(/\/articles\/\d+/)) {
    const articleId = urlPath.split("/").pop();
    loadArticle(articleId);
  }
}

// Load articles list
function loadArticles(page = 1, categoryId = null, searchQuery = null) {
  const articlesContainer = document.getElementById("articles-container");
  if (!articlesContainer) return;

  articlesContainer.innerHTML =
    '<div class="loading">Loading articles...</div>';

  // Build query params
  let queryParams = `page=${page}`;
  if (categoryId) {
    queryParams += `&categoryId=${categoryId}`;
  }
  if (searchQuery) {
    queryParams += `&q=${encodeURIComponent(searchQuery)}`;
  }

  // Determine endpoint
  let endpoint = `${API_URL}/articles`;
  if (searchQuery) {
    endpoint = `${API_URL}/articles/search`;
  }

  fetch(`${endpoint}?${queryParams}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.articles && data.articles.length > 0) {
        let articlesHtml = "";
        data.articles.forEach((article) => {
          articlesHtml += `
            <div class="card article-card">
              <img src="/images/${
                article.thumbnail || "placeholder.jpg"
              }" alt="${article.title}" class="card-thumbnail">
              <div class="card-body">
                <h3 class="card-title">
                  <a href="/articles/${article.id}">${article.title}</a>
                </h3>
                <p class="card-text">${article.content.substring(0, 100)}...</p>
                <div class="card-meta">
                  <span>${article.category.name}</span>
                  <span>${formatDate(article.created_at)}</span>
                </div>
              </div>
            </div>
          `;
        });

        articlesContainer.innerHTML = articlesHtml;

        // Update pagination
        const pagination = document.getElementById("pagination");
        if (pagination) {
          const baseUrl = searchQuery ? "/articles/search" : "/articles";
          pagination.innerHTML = createPagination(
            data.currentPage,
            data.totalPages,
            baseUrl
          );
        }
      } else {
        articlesContainer.innerHTML = "<p>No articles found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error loading articles:", error);
      articlesContainer.innerHTML =
        "<p>Failed to load articles. Please try again.</p>";
    });

  // Load categories for filter
  loadCategories();
}

// Load single article
function loadArticle(articleId) {
  fetch(`${API_URL}/articles/${articleId}`, {
    headers: {
      "x-access-token": localStorage.getItem("token") || "",
    },
  })
    .then((response) => response.json())
    .then((article) => {
      // Set article metadata
      document.getElementById("article-category").textContent =
        article.category.name;
      document.getElementById("article-date").textContent = formatDate(
        article.created_at
      );
      document.getElementById("article-title").textContent = article.title;
      document.getElementById("author-avatar").src = `/images/${
        article.author.avatar || "default-avatar.png"
      }`;
      document.getElementById("author-name").textContent =
        article.author.full_name || article.author.username;

      // Set article content
      document.getElementById("article-content").innerHTML =
        formatArticleContent(article.content);

      // Set likes
      document.getElementById(
        "likes-count"
      ).textContent = `${article.likes} likes`;

      // Update like button
      const likeBtn = document.getElementById("like-btn");
      if (likeBtn) {
        if (article.isLiked) {
          likeBtn.classList.add("liked");
          likeBtn.innerHTML = '<span class="icon">♥</span> Unlike';
        }

        likeBtn.addEventListener("click", function () {
          toggleLike(article.id);
        });
      }

      // Load comments
      loadComments("article", article.id);

      // Set page title
      document.title = `${article.title} - DeepSI`;
    })
    .catch((error) => {
      console.error("Error loading article:", error);
      document.getElementById("article-content").innerHTML =
        "<p>Failed to load article. Please try again.</p>";
    });
}

// Format article content with proper paragraphs
function formatArticleContent(content) {
  // Split by newlines and wrap each paragraph in <p> tags
  return content
    .split("\n\n")
    .filter((para) => para.trim() !== "")
    .map((para) => `<p>${para}</p>`)
    .join("");
}

// Toggle article like
function toggleLike(articleId) {
  const token = localStorage.getItem("token");
  if (!token) {
    showAuthModal();
    return;
  }

  fetch(`${API_URL}/articles/${articleId}/like`, {
    method: "POST",
    headers: {
      "x-access-token": token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Update like button and count
      const likeBtn = document.getElementById("like-btn");
      const likesCount = document.getElementById("likes-count");

      if (data.liked) {
        likeBtn.classList.add("liked");
        likeBtn.innerHTML = '<span class="icon">♥</span> Unlike';
      } else {
        likeBtn.classList.remove("liked");
        likeBtn.innerHTML = '<span class="icon">♥</span> Like';
      }

      likesCount.textContent = `${data.likes} likes`;
    })
    .catch((error) => {
      console.error("Error toggling like:", error);
    });
}

// Setup article filters
function setupArticleFilters() {
  // Category filter
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", function () {
      const categoryId = this.value;
      loadArticles(1, categoryId);
    });
  }

  // Search
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-articles");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", function () {
      const query = searchInput.value.trim();
      if (query) {
        loadArticles(1, null, query);
      }
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const query = this.value.trim();
        if (query) {
          loadArticles(1, null, query);
        }
      }
    });
  }
}

// Load categories for filter
function loadCategories() {
  const categoryFilter = document.getElementById("category-filter");
  if (!categoryFilter) return;

  fetch(`${API_URL}/categories`)
    .then((response) => response.json())
    .then((categories) => {
      let options = '<option value="">All Categories</option>';

      categories.forEach((category) => {
        options += `<option value="${category.id}">${category.name}</option>`;
      });

      categoryFilter.innerHTML = options;
    })
    .catch((error) => {
      console.error("Error loading categories:", error);
    });
}
