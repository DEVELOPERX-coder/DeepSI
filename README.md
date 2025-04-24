# DeepSI - Educational Platform

DeepSI is a full-stack web application for hosting educational content, courses, and articles with user management and interaction features. The platform features a sleek dark-themed UI as shown in the provided mockups.

## Features

1. **User Authentication**

   - Registration and login
   - Profile management
   - JWT-based authentication

2. **Articles**

   - Browse and search articles
   - Like and save articles
   - Comment on articles with threaded replies
   - Article categories

3. **Courses**

   - Browse available courses
   - Enroll in courses
   - Track progress
   - Video lectures with resources
   - Comment on lectures

4. **Donations**
   - Make donations to support content
   - Anonymous donation option
   - Donation messages

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Setup Instructions

Follow these steps to get the application running on your local machine:

### Prerequisites

- Node.js (v14+ recommended)
- MySQL (v5.7+ or v8.0+)
- npm or yarn

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/deepsi.git
cd deepsi
```

2. **Set up the database**

- Create a MySQL database named `deepsi_db`
- Import the schema and sample data from `database/deepsi_db.sql`:

```bash
mysql -u root -p deepsi_db < database/deepsi_db.sql
```

3. **Set up environment variables**

Create a `.env` file in the `backend` directory with the following variables:

```
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=deepsi_db
JWT_SECRET=your_jwt_secret_key
```

4. **Install backend dependencies**

```bash
cd backend
npm install
```

5. **Install frontend dependencies (if any)**

```bash
cd ../frontend
npm install
```

6. **Start the server**

```bash
cd ../backend
npm start
```

The application should now be running at `http://localhost:8080`.

## Application Structure

### Backend API Routes

#### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login and get JWT token

#### User

- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/liked-articles` - Get user's liked articles
- `GET /api/user/enrolled-courses` - Get user's enrolled courses

#### Articles

- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/like` - Like/unlike article
- `GET /api/articles/search` - Search articles

#### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `GET /api/lectures/:lectureId` - Get lecture by ID
- `POST /api/courses/:id/enroll` - Enroll in course
- `PUT /api/courses/:id/progress` - Update course progress
- `GET /api/courses/search` - Search courses

#### Comments

- `POST /api/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `GET /api/comments/:id/replies` - Get comment replies

#### Donations

- `POST /api/donations` - Make donation
- `GET /api/donations/recent` - Get recent donations

### Frontend Pages

- `/` - Home page
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/articles` - Articles list
- `/articles/:id` - Article detail
- `/courses` or `/lessons` - Courses list
- `/courses/:id` - Course detail
- `/lectures/:id` - Lecture view
- `/donate` - Donation page
- `/profile` - User profile
- `/my-courses` - User enrolled courses
- `/liked-articles` - User liked articles

## Sample User Accounts

You can use these sample accounts to test the application:

1. **Admin User**

   - Username: admin
   - Password: admin123

2. **Instructor**

   - Username: sachin
   - Password: admin123

3. **Regular User**
   - Username: user
   - Password: admin123

## Accessing Features

1. **Viewing Articles and Courses**

   - Browse through the articles and courses without logging in
   - Use the search functionality to find specific content
   - Filter by categories

2. **User Features (requires login)**

   - Like articles
   - Comment on articles and lectures
   - Enroll in courses
   - Track course progress
   - View your enrolled courses and liked articles

3. **Donations**
   - Make a donation with or without an account
   - Choose to make your donation anonymous
   - Leave a message with your donation

## Customization

### Adding Custom Content

- **Articles**: Add new articles by inserting records into the `articles` table
- **Courses**: Add courses, sections, and lectures by inserting records into the respective tables
- **Categories**: Add new categories in the `categories` table

### Styling

The application uses a dark theme as shown in the mockups. You can customize the colors and styling by modifying the CSS variables in the `frontend/public/css/main.css` file:

```css
:root {
  --primary-color: #00d0a3;
  --secondary-color: #8646d4;
  --dark-bg: #12151a;
  --darker-bg: #0a0c10;
  --card-bg: #1a1e25;
  --text-color: #ffffff;
  --text-secondary: #a9b2c3;
  --border-color: #2c333d;
}
```

## License

This project is licensed under the GNU General Public License.

---

# DeepSI - Educational Platform

A full-stack web application for hosting educational content, courses, and articles with user management and interaction features.

## Project Structure

```
deepsi/
│
├── backend/                # Node.js server
│   ├── config/             # Configuration files
│   │   ├── db.config.js    # Database configuration
│   │   └── auth.config.js  # Authentication configuration
│   │
│   ├── controllers/        # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── article.controller.js
│   │   ├── course.controller.js
│   │   ├── comment.controller.js
│   │   └── donation.controller.js
│   │
│   ├── middlewares/        # Middleware functions
│   │   ├── auth.js         # Authentication middleware
│   │   └── verifySignUp.js # Signup verification
│   │
│   ├── models/             # Database models
│   │   ├── user.model.js
│   │   ├── article.model.js
│   │   ├── course.model.js
│   │   ├── comment.model.js
│   │   ├── donation.model.js
│   │   └── index.js        # Models initialization
│   │
│   ├── routes/             # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── article.routes.js
│   │   ├── course.routes.js
│   │   ├── comment.routes.js
│   │   └── donation.routes.js
│   │
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
│
├── frontend/               # Client-side code
│   ├── public/             # Static assets
│   │   ├── css/            # Stylesheets
│   │   │   ├── main.css
│   │   │   ├── auth.css
│   │   │   ├── courses.css
│   │   │   ├── articles.css
│   │   │   └── donation.css
│   │   │
│   │   ├── js/             # JavaScript files
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── articles.js
│   │   │   ├── donation.js
│   │   │   └── main.js
│   │   │
│   │   ├── images/         # Image assets
│   │   │   ├── logo.png
│   │   │   ├── icons/
│   │   │   └── thumbnails/
│   │   │
│   │   └── favicon.ico
│   │
│   ├── views/              # HTML templates
│   │   ├── index.html      # Home page
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   └── signup.html
│   │   │
│   │   ├── courses/
│   │   │   ├── index.html
│   │   │   ├── course.html
│   │   │   └── lecture.html
│   │   │
│   │   ├── articles/
│   │   │   ├── index.html
│   │   │   └── article.html
│   │   │
│   │   └── donation/
│   │       └── index.html
│   │
│   └── package.json        # Frontend dependencies
│
├── database/               # Database files
│   └── deepsi_db.sql       # SQL schema and initial data
│
└── README.md               # Project documentation
```

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Features

1. **User Authentication**

   - Registration and login
   - Profile management

2. **Articles**

   - Browse articles
   - Like and save articles
   - Comment on articles
   - Article categories

3. **Courses**

   - Browse available courses
   - Enroll in courses
   - Track progress
   - Video lectures with resources
   - Comment on lectures

4. **Donations**

   - Make donations to support content
   - Anonymous donation option
   - Donation messages

5. **Other Features**
   - Search functionality
   - Social sharing
   - Dark theme UI (as shown in screenshots)
