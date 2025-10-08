

### **Project Overview**

MAPLMS is a comprehensive Learning Management System designed to streamline academic processes for educational institutions. It provides a centralized platform for administrators, teachers, and students to manage courses, track progress, and facilitate communication. The system is divided into three main user roles: Admin, Teacher, and Student, each with a dedicated set of features and functionalities.

### **Key Features**

#### **Admin**

* **User Management**: Admins can add, edit, and manage user accounts for teachers and students.
* **Course Management**: Create and manage courses, assign teachers to courses, and enroll students.
* **Mentor-Mentee Assignment**: Assign mentors to mentees to facilitate guidance and support.
* **Reporting**: Generate various reports, including course-wise, faculty-wise, and semester-wise performance reports.
* **AI Timetable Generation**: An integrated Django application that uses AI to automatically generate and manage timetables.

#### **Teacher**

* **Course and CO Management**: Teachers can manage their assigned courses, define Course Outcomes (COs), and map them to Program Outcomes (POs).
* **LMS Functionalities**:
    * **Classroom and Cohort Management**: Create and manage classrooms and cohorts for different courses and batches.
    * **Activities**: Post assignments, quizzes, and other learning materials for students.
    * **Attendance**: Track and manage student attendance for lectures and practicals.
    * **Submissions**: View and grade student submissions for assignments.
* **Mentorship**: View mentee details, and communicate with them through the platform.
* **Result and Attainment Calculation**: Upload student marks, calculate results, and determine the attainment of COs and POs.

#### **Student**

* **Course Enrollment**: Students can view and enroll in available courses[cite: 24, 58].
* **LMS Access**:
    * **View Activities**: Access course materials, assignments, and quizzes posted by teachers[cite: 30, 64].
    * **Submit Assignments**: Upload and submit completed assignments[cite: 326].
    * **View Attendance**: Check their attendance records for different courses[cite: 25, 59].
* **Mentee Profile**: View their mentor's details and communicate with them[cite: 29, 62, 314, 316].
* **Feedback**: Provide feedback on courses and teachers[cite: 26, 60].
* **Profile Management**: Manage their personal and academic profiles[cite: 27, 303].

### **Technologies Used**

* **Frontend**: React.js, Material-UI, Tailwind CSS
* **Backend**: Node.js, Express.js
* **Database**: MongoDB
* **AI Timetable Generator**: Django, Python

### File Breakdown

| File/Folder | Description |
| --- | --- |
| **`Backend`** | Contains the server-side code written in Node.js and Express.js. It handles the core logic of the application, including user authentication, database interactions, and API endpoints. |
| **`aitimetable`** | A separate Django project for generating timetables using AI. It has its own set of models, views, and templates. |
| **`client`** | The frontend of the application, built with React.js. It provides the user interface for interacting with the backend and displays data to the user. |
| **`Backend/config/dbConfig.js`** | Configures the connection to the MongoDB database. |
| **`Backend/controller`** | Contains the business logic for handling requests for different user roles (Admin, Teacher, Student). |
| **`Backend/routes`** | Defines the API routes for the application, mapping URLs to specific controller functions]. |
| **`Backend/index.js`** | The main entry point for the backend server. It initializes the Express application, connects to the database, and sets up the API routes[cite: 45]. |
| **`client/src/App.js`** | The main component of the React application. It sets up the routing for different pages and components. |
| **`client/src/api.js`** | Contains the functions for making API calls to the backend server. |
| **`client/src/components`** | A collection of reusable React components used throughout the application, such as the Navbar, Dashboard, and various forms. |
| **`client/src/pages`** | Contains the main pages of the application, organized by user roles (Admin, Teacher, Student). Each page represents a specific feature or view within the application. |
| **`aitimetable/manage.py`** | A command-line utility that lets you interact with this Django project in various ways[cite: 236]. |
| **`aitimetable/projttgs/settings.py`** | Contains the settings and configuration for the Django project, including database setup, installed apps, and middleware[cite: 242]. |


