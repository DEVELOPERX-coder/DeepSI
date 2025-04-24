const API_URL = "http://localhost:8080/api";
let currentUser = null;

// Check if user is logged in on page load
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  setupNavigation();
});

// Check authentication status
function checkAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    fetch(`${API_URL}/user/profile`, {
      headers: {
        "x-access-token": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          // Invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return null;
        }
      })
      .then((data) => {
        if (data) {
          currentUser = data;
          localStorage.setItem("user", JSON.stringify(data));
          updateAuthUI(true);
        } else {
          updateAuthUI(false);
        }
      })
      .catch((error) => {
        console.error("Auth check error:", error);
        updateAuthUI(false);
      });
  } else {
    updateAuthUI(false);
  }
}

// Update UI based on authentication status
function updateAuthUI(isLoggedIn) {
  const header = document.querySelector("header");

  // Remove existing auth buttons if any
  const existingAuthBtn = header.querySelector(".auth-btn");
  if (existingAuthBtn) {
    existingAuthBtn.remove();
  }

  if (isLoggedIn) {
    // User is logged in - show profile/logout
    const user = JSON.parse(localStorage.getItem("user"));
    const authBtn = document.createElement("div");
    authBtn.className = "auth-btn";
    authBtn.innerHTML = `
      <div class="dropdown">
        <button class="dropdown-btn">${user.username} ▼</button>
        <div class="dropdown-content">
          <a href="/profile">Profile</a>
          <a href="/my-courses">My Courses</a>
          <a href="/liked-articles">Liked Articles</a>
          <a href="#" id="logout-btn">Logout</a>
        </div>
      </div>
    `;
    header.appendChild(authBtn);

    // Add logout event listener
    document
      .getElementById("logout-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        logout();
      });

    // Add comment forms if on article or lecture page
    addCommentForms();
  } else {
    // User is not logged in - show login/signup
    const authBtn = document.createElement("div");
    authBtn.className = "auth-btn";
    authBtn.innerHTML = `
      <button id="show-auth-modal" class="btn btn-outlined">Login / Sign Up</button>
    `;
    header.appendChild(authBtn);

    // Add modal event listener
    document
      .getElementById("show-auth-modal")
      .addEventListener("click", function () {
        showAuthModal();
      });
  }
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  currentUser = null;
  updateAuthUI(false);

  // Redirect to home if on protected page
  const protectedPages = ["/profile", "/my-courses", "/liked-articles"];
  const currentPath = window.location.pathname;
  if (protectedPages.includes(currentPath)) {
    window.location.href = "/";
  }
}

// Show authentication modal
function showAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.style.display = "block";

    // Add event listeners
    const closeModal = modal.querySelector(".close-modal");
    closeModal.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // Tab switching
    const tabBtns = modal.querySelectorAll(".tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const tab = this.dataset.tab;

        // Update active tab button
        tabBtns.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Show active tab content
        const tabContents = modal.querySelectorAll(".tab-content");
        tabContents.forEach((content) => content.classList.remove("active"));
        document.getElementById(`${tab}-tab`).classList.add("active");
      });
    });

    // Close modal when clicking outside
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  } else {
    // Redirect to login page if modal doesn't exist
    window.location.href = "/auth/login";
  }
}

// Add comment forms to article/lecture pages for logged in users
function addCommentForms() {
  const commentFormContainer = document.getElementById(
    "comment-form-container"
  );
  if (commentFormContainer) {
    let formHtml = "";
    let targetType = "";
    let targetId = "";

    // Determine if we're on an article or lecture page
    const urlPath = window.location.pathname;
    if (urlPath.includes("/articles/")) {
      targetType = "article";
      targetId = urlPath.split("/").pop();
    } else if (urlPath.includes("/lectures/")) {
      targetType = "lecture";
      targetId = urlPath.split("/").pop();
    }

    if (targetType && targetId) {
      formHtml = `
        <form id="comment-form" class="comment-form">
          <div class="form-group">
            <textarea name="content" placeholder="Write your comment..." required></textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary">Post Comment</button>
          </div>
          <input type="hidden" name="target_type" value="${targetType}">
          <input type="hidden" name="target_id" value="${targetId}">
        </form>
      `;

      commentFormContainer.innerHTML = formHtml;

      // Add submit event listener
      document
        .getElementById("comment-form")
        .addEventListener("submit", function (e) {
          e.preventDefault();
          submitComment(this);
        });
    }
  }
}

// Submit comment
function submitComment(form) {
  const token = localStorage.getItem("token");
  if (!token) {
    showAuthModal();
    return;
  }

  const content = form.content.value;
  const targetType = form.target_type.value;
  const targetId = form.target_id.value;

  const commentData = {
    content: content,
  };

  if (targetType === "article") {
    commentData.article_id = targetId;
  } else if (targetType === "lecture") {
    commentData.lecture_id = targetId;
  }

  fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify(commentData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        // Comment added successfully
        form.content.value = "";

        // Refresh comments list
        loadComments(targetType, targetId);
      }
    })
    .catch((error) => {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    });
}

// Load comments for article or lecture
function loadComments(targetType, targetId) {
  const commentsList = document.getElementById("comments-list");
  if (!commentsList) return;

  commentsList.innerHTML = '<div class="loading">Loading comments...</div>';

  let url = "";
  if (targetType === "article") {
    url = `${API_URL}/articles/${targetId}`;
  } else if (targetType === "lecture") {
    url = `${API_URL}/lectures/${targetId}`;
  }

  if (url) {
    const token = localStorage.getItem("token");
    const headers = token ? { "x-access-token": token } : {};

    fetch(url, { headers })
      .then((response) => response.json())
      .then((data) => {
        if (data.comments && data.comments.length > 0) {
          let commentsHtml = "";
          data.comments.forEach((comment) => {
            commentsHtml += createCommentHtml(comment);
          });
          commentsList.innerHTML = commentsHtml;

          // Add reply button event listeners
          const replyBtns = commentsList.querySelectorAll(".comment-reply-btn");
          replyBtns.forEach((btn) => {
            btn.addEventListener("click", function () {
              const commentId = this.dataset.commentId;
              toggleReplyForm(commentId);
            });
          });
        } else {
          commentsList.innerHTML =
            "<p>No comments yet. Be the first to comment!</p>";
        }
      })
      .catch((error) => {
        console.error("Error loading comments:", error);
        commentsList.innerHTML =
          "<p>Failed to load comments. Please refresh the page.</p>";
      });
  }
}

// Create HTML for a comment
function createCommentHtml(comment) {
  const date = new Date(comment.created_at).toLocaleDateString();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAuthor = user && user.id === comment.user.id;

  let actionsHtml = "";
  if (isAuthor) {
    actionsHtml = `
      <button class="comment-edit-btn" data-comment-id="${comment.id}">Edit</button>
      <button class="comment-delete-btn" data-comment-id="${comment.id}">Delete</button>
    `;
  }

  return `
    <div class="comment" id="comment-${comment.id}">
      <div class="comment-header">
        <div class="comment-author">
          <img src="/images/${comment.user.avatar}" alt="${
    comment.user.username
  }">
          <span>${comment.user.full_name || comment.user.username}</span>
        </div>
        <span class="comment-date">${date}</span>
      </div>
      <div class="comment-content">${comment.content}</div>
      <div class="comment-actions">
        <button class="comment-reply-btn" data-comment-id="${
          comment.id
        }">Reply</button>
        ${actionsHtml}
      </div>
      <div class="comment-reply-form" id="reply-form-${
        comment.id
      }" style="display: none;"></div>
      <div class="comment-replies" id="replies-${comment.id}">
        ${
          comment.replies
            ? comment.replies.map((reply) => createCommentHtml(reply)).join("")
            : ""
        }
      </div>
    </div>
  `;
}

// Toggle reply form visibility
function toggleReplyForm(commentId) {
  const replyForm = document.getElementById(`reply-form-${commentId}`);

  if (replyForm.style.display === "none" || replyForm.innerHTML === "") {
    // Show form
    replyForm.style.display = "block";
    replyForm.innerHTML = `
      <form class="comment-form reply-form">
        <div class="form-group">
          <textarea name="content" placeholder="Write your reply..." required></textarea>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary">Post Reply</button>
          <button type="button" class="btn btn-cancel">Cancel</button>
        </div>
      </form>
    `;

    // Add event listeners
    const form = replyForm.querySelector("form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitReply(form, commentId);
    });

    const cancelBtn = replyForm.querySelector(".btn-cancel");
    cancelBtn.addEventListener("click", function () {
      replyForm.style.display = "none";
    });
  } else {
    // Hide form
    replyForm.style.display = "none";
  }
}

// Submit reply to comment
function submitReply(form, parentId) {
  const token = localStorage.getItem("token");
  if (!token) {
    showAuthModal();
    return;
  }

  const content = form.content.value;
  const urlPath = window.location.pathname;
  let targetType = "";
  let targetId = "";

  if (urlPath.includes("/articles/")) {
    targetType = "article";
    targetId = urlPath.split("/").pop();
  } else if (urlPath.includes("/lectures/")) {
    targetType = "lecture";
    targetId = urlPath.split("/").pop();
  }

  const replyData = {
    content: content,
    parent_id: parentId,
  };

  if (targetType === "article") {
    replyData.article_id = targetId;
  } else if (targetType === "lecture") {
    replyData.lecture_id = targetId;
  }

  fetch(`${API_URL}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify(replyData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        // Reply added successfully
        const replyForm = document.getElementById(`reply-form-${parentId}`);
        replyForm.style.display = "none";

        // Refresh comments
        loadCommentReplies(parentId);
      }
    })
    .catch((error) => {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    });
}

// Load replies to a comment
function loadCommentReplies(commentId) {
  const repliesContainer = document.getElementById(`replies-${commentId}`);
  if (!repliesContainer) return;

  fetch(`${API_URL}/comments/${commentId}/replies`)
    .then((response) => response.json())
    .then((replies) => {
      if (replies.length > 0) {
        let repliesHtml = "";
        replies.forEach((reply) => {
          repliesHtml += createCommentHtml(reply);
        });
        repliesContainer.innerHTML = repliesHtml;

        // Add reply button event listeners for new replies
        const replyBtns =
          repliesContainer.querySelectorAll(".comment-reply-btn");
        replyBtns.forEach((btn) => {
          btn.addEventListener("click", function () {
            const commentId = this.dataset.commentId;
            toggleReplyForm(commentId);
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error loading replies:", error);
    });
}

// Setup navigation for current page
function setupNavigation() {
  const currentPath = window.location.pathname;

  // Highlight active nav link
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    if (currentPath.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Helper function to create pagination
function createPagination(currentPage, totalPages, baseUrl) {
  let paginationHtml = "";

  // Previous button
  if (currentPage > 1) {
    paginationHtml += `<a href="${baseUrl}?page=${
      currentPage - 1
    }" class="page-link">Previous</a>`;
  }

  // Page numbers
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHtml += `<a href="${baseUrl}?page=${i}" class="page-link active">${i}</a>`;
    } else {
      paginationHtml += `<a href="${baseUrl}?page=${i}" class="page-link">${i}</a>`;
    }
  }

  // Next button
  if (currentPage < totalPages) {
    paginationHtml += `<a href="${baseUrl}?page=${
      currentPage + 1
    }" class="page-link">Next</a>`;
  }

  return paginationHtml;
}
