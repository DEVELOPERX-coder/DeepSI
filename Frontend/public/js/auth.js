document.addEventListener("DOMContentLoaded", function () {
  setupAuthForms();
});

// Setup authentication forms
function setupAuthForms() {
  // Login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleLogin(this);
    });
  }

  // Signup form
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSignup(this);
    });
  }
}

// Handle login form submission
function handleLogin(form) {
  const username = form.querySelector('[name="username"]').value;
  const password = form.querySelector('[name="password"]').value;

  const loginData = {
    username: username,
    password: password,
  };

  fetch(`${API_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.accessToken) {
        // Login successful
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            full_name: data.full_name,
          })
        );

        // Close modal if it exists
        const modal = document.getElementById("auth-modal");
        if (modal) {
          modal.style.display = "none";
        }

        // Update UI
        updateAuthUI(true);

        // Redirect if on login page
        if (window.location.pathname.includes("/auth/login")) {
          window.location.href = "/";
        } else {
          // Refresh current page to update content based on auth status
          window.location.reload();
        }
      } else {
        // Login failed
        showFormError(
          form,
          data.message || "Login failed. Please check your credentials."
        );
      }
    })
    .catch((error) => {
      console.error("Login error:", error);
      showFormError(form, "An error occurred. Please try again.");
    });
}

// Handle signup form submission
function handleSignup(form) {
  const fullName = form.querySelector('[name="full_name"]').value;
  const username = form.querySelector('[name="username"]').value;
  const email = form.querySelector('[name="email"]').value;
  const password = form.querySelector('[name="password"]').value;

  const signupData = {
    full_name: fullName,
    username: username,
    email: email,
    password: password,
  };

  fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signupData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message && data.message.includes("successfully")) {
        // Signup successful - now login
        const loginData = {
          username: username,
          password: password,
        };

        return fetch(`${API_URL}/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        });
      } else {
        // Signup failed
        throw new Error(data.message || "Sign up failed. Please try again.");
      }
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.accessToken) {
        // Login successful after signup
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            username: data.username,
            email: data.email,
            full_name: data.full_name,
          })
        );

        // Close modal if it exists
        const modal = document.getElementById("auth-modal");
        if (modal) {
          modal.style.display = "none";
        }

        // Update UI
        updateAuthUI(true);

        // Redirect if on signup page
        if (window.location.pathname.includes("/auth/signup")) {
          window.location.href = "/";
        } else {
          // Refresh current page to update content based on auth status
          window.location.reload();
        }
      } else {
        // Login failed after signup
        throw new Error(
          data.message ||
            "Login failed after signup. Please try logging in manually."
        );
      }
    })
    .catch((error) => {
      console.error("Signup error:", error);
      showFormError(
        form,
        error.message || "An error occurred during signup. Please try again."
      );
    });
}

// Show form error message
function showFormError(form, message) {
  // Remove existing error message if any
  const existingError = form.querySelector(".form-error");
  if (existingError) {
    existingError.remove();
  }

  // Add new error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.textContent = message;
  form.insertBefore(errorDiv, form.firstChild);
}
