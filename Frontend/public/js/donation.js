document.addEventListener("DOMContentLoaded", function () {
  setupDonationPage();
});

// Setup donation page
function setupDonationPage() {
  const urlPath = window.location.pathname;

  if (urlPath === "/donate" || urlPath === "/donate/") {
    setupDonationForm();
    loadRecentDonations();
  }
}

// Setup donation form
function setupDonationForm() {
  const donationForm = document.getElementById("donation-form");
  if (!donationForm) return;

  // Amount buttons
  const amountBtns = document.querySelectorAll(".amount-btn");
  let selectedAmount = 5; // Default amount

  amountBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      amountBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      selectedAmount = parseInt(this.dataset.amount);
    });
  });

  // Set first button as active
  amountBtns[0].classList.add("active");

  // Pre-fill email if user is logged in
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const emailInput = document.getElementById("email");
    const nameInput = document.getElementById("name");

    if (emailInput) emailInput.value = user.email;
    if (nameInput) nameInput.value = user.full_name || user.username;
  }

  // Form submission
  donationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = this.email.value;
    const name = this.name.value;
    const message = this.message.value;
    const isAnonymous =
      this.querySelector('input[name="anonymous"]:checked').value === "yes";

    const donationData = {
      amount: selectedAmount,
      email: email,
      name: name,
      message: message,
      is_anonymous: isAnonymous,
    };

    // Add token if available
    const headers = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["x-access-token"] = token;
    }

    fetch(`${API_URL}/donations`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(donationData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("Thank you for your donation!");

          // Reset form
          donationForm.reset();
          amountBtns[0].classList.add("active");

          // Reload donations
          loadRecentDonations();
        }
      })
      .catch((error) => {
        console.error("Error making donation:", error);
        alert("Failed to process donation. Please try again.");
      });
  });
}

// Load recent donations
function loadRecentDonations() {
  const donationsList = document.getElementById("donations-list");
  const recentDonationsContainer = document.getElementById(
    "recent-donations-container"
  );

  if (!donationsList && !recentDonationsContainer) return;

  fetch(`${API_URL}/donations/recent`)
    .then((response) => response.json())
    .then((donations) => {
      if (donations.length > 0) {
        let donationsHtml = "";

        donations.forEach((donation) => {
          donationsHtml += `
            <div class="donation-item">
              <div class="donation-name">${donation.name} (${
            donation.amount
          }$)</div>
              <div class="donation-message">"${
                donation.message || "Thank you for your support!"
              }"</div>
            </div>
          `;
        });

        // Update donations list on donation page
        if (donationsList) {
          donationsList.innerHTML = donationsHtml;
        }

        // Update recent donations on home page
        if (recentDonationsContainer) {
          recentDonationsContainer.innerHTML = donationsHtml;
        }
      } else {
        const noDataHtml = "<p>No donations yet. Be the first to donate!</p>";

        if (donationsList) {
          donationsList.innerHTML = noDataHtml;
        }

        if (recentDonationsContainer) {
          recentDonationsContainer.innerHTML = noDataHtml;
        }
      }
    })
    .catch((error) => {
      console.error("Error loading donations:", error);
      const errorHtml = "<p>Failed to load donations.</p>";

      if (donationsList) {
        donationsList.innerHTML = errorHtml;
      }

      if (recentDonationsContainer) {
        recentDonationsContainer.innerHTML = errorHtml;
      }
    });
}
