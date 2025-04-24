document.addEventListener("DOMContentLoaded", function () {
  setupCoursesPage();
});

// Setup courses page functionality
function setupCoursesPage() {
  const urlPath = window.location.pathname;

  // Courses list page
  if (
    urlPath === "/courses" ||
    urlPath === "/lessons" ||
    urlPath === "/lessons/"
  ) {
    loadCourses();
    setupCourseFilters();
  }

  // Single course page
  else if (urlPath.match(/\/courses\/\d+/) || urlPath.match(/\/lessons\/\d+/)) {
    const courseId = urlPath.split("/").pop();
    loadCourse(courseId);
  }

  // Lecture page
  else if (urlPath.match(/\/lectures\/\d+/)) {
    const lectureId = urlPath.split("/").pop();
    loadLecture(lectureId);
  }
}

// Load courses list
function loadCourses(page = 1, categoryId = null, searchQuery = null) {
  const coursesContainer = document.getElementById("courses-container");
  if (!coursesContainer) return;

  coursesContainer.innerHTML = '<div class="loading">Loading courses...</div>';

  // Build query params
  let queryParams = `page=${page}`;
  if (categoryId) {
    queryParams += `&categoryId=${categoryId}`;
  }
  if (searchQuery) {
    queryParams += `&q=${encodeURIComponent(searchQuery)}`;
  }

  // Determine endpoint
  let endpoint = `${API_URL}/courses`;
  if (searchQuery) {
    endpoint = `${API_URL}/courses/search`;
  }

  fetch(`${endpoint}?${queryParams}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.courses && data.courses.length > 0) {
        let coursesHtml = "";
        data.courses.forEach((course) => {
          coursesHtml += `
            <div class="card course-card">
              <img src="/images/${
                course.thumbnail || "placeholder.jpg"
              }" alt="${course.title}" class="card-thumbnail">
              <div class="card-body">
                <h3 class="card-title">
                  <a href="/courses/${course.id}">${course.title}</a>
                </h3>
                <p class="card-text">${
                  course.description
                    ? course.description.substring(0, 100) + "..."
                    : "No description available."
                }</p>
                <div class="card-meta">
                  <span>${course.category.name}</span>
                  <span>${course.total_duration} min</span>
                </div>
              </div>
            </div>
          `;
        });

        coursesContainer.innerHTML = coursesHtml;

        // Update pagination
        const pagination = document.getElementById("pagination");
        if (pagination) {
          const baseUrl = searchQuery ? "/courses/search" : "/courses";
          pagination.innerHTML = createPagination(
            data.currentPage,
            data.totalPages,
            baseUrl
          );
        }
      } else {
        coursesContainer.innerHTML = "<p>No courses found.</p>";
      }
    })
    .catch((error) => {
      console.error("Error loading courses:", error);
      coursesContainer.innerHTML =
        "<p>Failed to load courses. Please try again.</p>";
    });

  // Load categories for filter
  loadCategories();
}

// Load single course
function loadCourse(courseId) {
  fetch(`${API_URL}/courses/${courseId}`, {
    headers: {
      "x-access-token": localStorage.getItem("token") || "",
    },
  })
    .then((response) => response.json())
    .then((course) => {
      // Set course metadata
      document.getElementById("course-category").textContent =
        course.category.name;
      document.getElementById(
        "course-duration"
      ).textContent = `${course.total_duration} min`;
      document.getElementById("course-title").textContent = course.title;
      document.getElementById("course-image").src = `/images/${
        course.thumbnail || "placeholder.jpg"
      }`;
      document.getElementById("instructor-avatar").src = `/images/${
        course.instructor.avatar || "default-avatar.png"
      }`;
      document.getElementById("instructor-name").textContent =
        course.instructor.full_name || course.instructor.username;

      // Set course description
      document.getElementById("course-description-content").innerHTML =
        formatArticleContent(course.description || "No description available.");

      // Set enrollment info
      const enrollmentInfo = document.getElementById("enrollment-info");
      if (course.enrollment) {
        // User is enrolled
        enrollmentInfo.innerHTML = `
          <p>You are enrolled in this course</p>
          <div class="progress">
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${course.enrollment.progress}%;"></div>
            </div>
            <span>${course.enrollment.progress}% complete</span>
          </div>
          <a href="/lectures/${course.sections[0].lectures[0].id}" class="btn btn-primary">Continue Learning</a>
        `;
      } else {
        // User is not enrolled
        enrollmentInfo.innerHTML = `
          <button id="enroll-btn" class="btn btn-primary">Enroll in Course</button>
        `;

        // Add enroll button event listener
        document
          .getElementById("enroll-btn")
          .addEventListener("click", function () {
            enrollCourse(courseId);
          });
      }

      // Set curriculum
      const curriculumSections = document.getElementById("curriculum-sections");
      if (course.sections && course.sections.length > 0) {
        let sectionsHtml = "";
        course.sections.forEach((section) => {
          let lecturesHtml = "";
          section.lectures.forEach((lecture) => {
            lecturesHtml += `
              <div class="lecture-item">
                <div class="lecture-title">
                  <span class="icon">▶</span>
                  <a href="/lectures/${lecture.id}">${lecture.title}</a>
                </div>
                <span class="lecture-duration">${lecture.duration} min</span>
              </div>
            `;
          });

          sectionsHtml += `
            <div class="curriculum-section">
              <div class="section-header">
                <div class="section-title">
                  <span class="icon">▶</span>
                  <h3>${section.title}</h3>
                </div>
                <span class="section-duration">${section.duration} min</span>
              </div>
              <div class="lectures-list">
                ${lecturesHtml}
              </div>
            </div>
          `;
        });

        curriculumSections.innerHTML = sectionsHtml;

        // Add section toggle event listeners
        const sectionHeaders =
          curriculumSections.querySelectorAll(".section-header");
        sectionHeaders.forEach((header) => {
          header.addEventListener("click", function () {
            const sectionTitle = this.querySelector(".section-title");
            const lecturesList = this.nextElementSibling;

            sectionTitle.classList.toggle("open");
            lecturesList.classList.toggle("open");
          });
        });
      } else {
        curriculumSections.innerHTML =
          "<p>No curriculum available for this course.</p>";
      }

      // Set page title
      document.title = `${course.title} - DeepSI`;
    })
    .catch((error) => {
      console.error("Error loading course:", error);
      document.getElementById("course-description-content").innerHTML =
        "<p>Failed to load course. Please try again.</p>";
    });
}

// Load lecture
function loadLecture(lectureId) {
  const token = localStorage.getItem("token");
  if (!token) {
    // Redirect to login for lecture view
    window.location.href = "/auth/login?redirect=/lectures/" + lectureId;
    return;
  }

  fetch(`${API_URL}/lectures/${lectureId}`, {
    headers: {
      "x-access-token": token,
    },
  })
    .then((response) => {
      if (response.status === 403) {
        // User not enrolled
        throw new Error(
          "You need to enroll in this course to access lectures."
        );
      }
      return response.json();
    })
    .then((lecture) => {
      // Set lecture title and description
      document.getElementById("lecture-title").textContent = lecture.title;
      document.getElementById("lecture-description").innerHTML =
        formatArticleContent(
          lecture.description || "No description available."
        );
      document.getElementById("description-content").innerHTML =
        formatArticleContent(
          lecture.description || "No description available."
        );

      // Set video source
      const videoElement = document.getElementById("lecture-video");
      videoElement.src = lecture.video_url;

      // Set course link
      const course = lecture.section.course;
      document.getElementById("course-link").textContent = course.title;
      document.getElementById("course-link").href = `/courses/${course.id}`;

      // Set resources
      if (lecture.resources) {
        try {
          const resources = JSON.parse(lecture.resources);
          const resourcesList = document.getElementById("resources-list");

          if (Object.keys(resources).length > 0) {
            let resourcesHtml = "";

            for (const [key, value] of Object.entries(resources)) {
              resourcesHtml += `
                <li><strong>${key}:</strong> <a href="${value}" target="_blank">${value}</a></li>
              `;
            }

            resourcesList.innerHTML = resourcesHtml;
          }
        } catch (e) {
          console.error("Error parsing resources:", e);
        }
      }

      // Set navigation buttons
      setupLectureNavigation(lecture, course);

      // Load sidebar curriculum
      loadSidebarCurriculum(course.id, lecture.id);

      // Load comments
      loadComments("lecture", lecture.id);

      // Set page title
      document.title = `${lecture.title} - DeepSI`;

      // Update progress when video ends
      videoElement.addEventListener("ended", function () {
        updateCourseProgress(course.id);
      });
    })
    .catch((error) => {
      console.error("Error loading lecture:", error);
      alert(error.message || "Failed to load lecture. Please try again.");
      window.location.href = "/courses";
    });
}

// Setup lecture navigation
function setupLectureNavigation(lecture, course) {
  const prevButton = document.getElementById("prev-lecture");
  const nextButton = document.getElementById("next-lecture");

  // Find current lecture index in the section
  const currentSectionId = lecture.section.id;
  const currentLectureIndex = lecture.section.lectures.findIndex(
    (l) => l.id === lecture.id
  );

  // Find current section index in the course
  const currentSectionIndex = course.sections.findIndex(
    (s) => s.id === currentSectionId
  );

  // Previous lecture logic
  if (currentLectureIndex > 0) {
    // Previous lecture in same section
    const prevLecture = lecture.section.lectures[currentLectureIndex - 1];
    prevButton.href = `/lectures/${prevLecture.id}`;
    prevButton.classList.remove("disabled");
  } else if (currentSectionIndex > 0) {
    // Last lecture of previous section
    const prevSection = course.sections[currentSectionIndex - 1];
    const prevLecture = prevSection.lectures[prevSection.lectures.length - 1];
    prevButton.href = `/lectures/${prevLecture.id}`;
    prevButton.classList.remove("disabled");
  } else {
    // First lecture of first section - no previous
    prevButton.classList.add("disabled");
  }

  // Next lecture logic
  if (currentLectureIndex < lecture.section.lectures.length - 1) {
    // Next lecture in same section
    const nextLecture = lecture.section.lectures[currentLectureIndex + 1];
    nextButton.href = `/lectures/${nextLecture.id}`;
    nextButton.classList.remove("disabled");
  } else if (currentSectionIndex < course.sections.length - 1) {
    // First lecture of next section
    const nextSection = course.sections[currentSectionIndex + 1];
    const nextLecture = nextSection.lectures[0];
    nextButton.href = `/lectures/${nextLecture.id}`;
    nextButton.classList.remove("disabled");
  } else {
    // Last lecture of last section - no next
    nextButton.classList.add("disabled");
  }
}

// Load sidebar curriculum
function loadSidebarCurriculum(courseId, currentLectureId) {
  const sidebarCurriculum = document.getElementById("sidebar-curriculum");

  fetch(`${API_URL}/courses/${courseId}`, {
    headers: {
      "x-access-token": localStorage.getItem("token") || "",
    },
  })
    .then((response) => response.json())
    .then((course) => {
      if (course.sections && course.sections.length > 0) {
        let sectionsHtml = "";

        course.sections.forEach((section) => {
          let lecturesHtml = "";

          section.lectures.forEach((lecture) => {
            const isActive = lecture.id === parseInt(currentLectureId);
            lecturesHtml += `
              <div class="lecture-item ${isActive ? "active" : ""}">
                <div class="lecture-title">
                  <span class="icon">▶</span>
                  <a href="/lectures/${lecture.id}">${lecture.title}</a>
                </div>
                <span class="lecture-duration">${lecture.duration} min</span>
              </div>
            `;
          });

          // Determine if section should be open (if it contains the current lecture)
          const sectionContainsCurrentLecture = section.lectures.some(
            (lecture) => lecture.id === parseInt(currentLectureId)
          );

          sectionsHtml += `
            <div class="curriculum-section">
              <div class="section-header">
                <div class="section-title ${
                  sectionContainsCurrentLecture ? "open" : ""
                }">
                  <span class="icon">▶</span>
                  <h3>${section.title}</h3>
                </div>
                <span class="section-duration">${section.duration} min</span>
              </div>
              <div class="lectures-list ${
                sectionContainsCurrentLecture ? "open" : ""
              }">
                ${lecturesHtml}
              </div>
            </div>
          `;
        });

        sidebarCurriculum.innerHTML = sectionsHtml;

        // Add section toggle event listeners
        const sectionHeaders =
          sidebarCurriculum.querySelectorAll(".section-header");
        sectionHeaders.forEach((header) => {
          header.addEventListener("click", function () {
            const sectionTitle = this.querySelector(".section-title");
            const lecturesList = this.nextElementSibling;

            sectionTitle.classList.toggle("open");
            lecturesList.classList.toggle("open");
          });
        });
      } else {
        sidebarCurriculum.innerHTML = "<p>No curriculum available.</p>";
      }
    })
    .catch((error) => {
      console.error("Error loading sidebar curriculum:", error);
      sidebarCurriculum.innerHTML = "<p>Failed to load curriculum.</p>";
    });
}

// Enroll in course
function enrollCourse(courseId) {
  const token = localStorage.getItem("token");

  if (!token) {
    showAuthModal();
    return;
  }

  fetch(`${API_URL}/courses/${courseId}/enroll`, {
    method: "POST",
    headers: {
      "x-access-token": token,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        // Refresh course page to show enrollment status
        window.location.reload();
      }
    })
    .catch((error) => {
      console.error("Error enrolling in course:", error);
      alert("Failed to enroll in course. Please try again.");
    });
}

// Update course progress
function updateCourseProgress(courseId) {
  const token = localStorage.getItem("token");

  if (!token) return;

  // Calculate new progress (simplified - in real app would be based on completed lectures)
  // For now, just increment by 10%
  fetch(`${API_URL}/courses/${courseId}`, {
    headers: {
      "x-access-token": token,
    },
  })
    .then((response) => response.json())
    .then((course) => {
      if (course.enrollment) {
        const currentProgress = course.enrollment.progress;
        const newProgress = Math.min(currentProgress + 10, 100);

        return fetch(`${API_URL}/courses/${courseId}/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ progress: newProgress }),
        });
      }
    })
    .catch((error) => {
      console.error("Error updating progress:", error);
    });
}

// Setup course filters
function setupCourseFilters() {
  // Category filter
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", function () {
      const categoryId = this.value;
      loadCourses(1, categoryId);
    });
  }

  // Search
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-courses");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", function () {
      const query = searchInput.value.trim();
      if (query) {
        loadCourses(1, null, query);
      }
    });

    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        const query = this.value.trim();
        if (query) {
          loadCourses(1, null, query);
        }
      }
    });
  }
}
