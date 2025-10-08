

### **Project Overview**

MAPLMS is a comprehensive Learning Management System designed to streamline academic processes for educational institutions. It provides a centralized platform for administrators, teachers, and students to manage courses, track progress, and facilitate communication. The system is divided into three main user roles: Admin, Teacher, and Student, each with a dedicated set of features and functionalities.

### **Key Features**

#### **Admin**

* [cite_start]**User Management**: Admins can add, edit, and manage user accounts for teachers and students[cite: 19, 53].
* [cite_start]**Course Management**: Create and manage courses, assign teachers to courses, and enroll students[cite: 18, 52].
* [cite_start]**Mentor-Mentee Assignment**: Assign mentors to mentees to facilitate guidance and support[cite: 16, 50].
* [cite_start]**Reporting**: Generate various reports, including course-wise, faculty-wise, and semester-wise performance reports[cite: 17, 51].
* [cite_start]**AI Timetable Generation**: An integrated Django application that uses AI to automatically generate and manage timetables[cite: 236].

#### **Teacher**

* [cite_start]**Course and CO Management**: Teachers can manage their assigned courses, define Course Outcomes (COs), and map them to Program Outcomes (POs)[cite: 111, 147].
* **LMS Functionalities**:
    * [cite_start]**Classroom and Cohort Management**: Create and manage classrooms and cohorts for different courses and batches[cite: 34, 36, 70, 72].
    * [cite_start]**Activities**: Post assignments, quizzes, and other learning materials for students[cite: 35, 71].
    * [cite_start]**Attendance**: Track and manage student attendance for lectures and practicals[cite: 33, 69].
    * [cite_start]**Submissions**: View and grade student submissions for assignments[cite: 326].
* [cite_start]**Mentorship**: View mentee details, and communicate with them through the platform[cite: 37, 73, 314, 316].
* [cite_start]**Result and Attainment Calculation**: Upload student marks, calculate results, and determine the attainment of COs and POs[cite: 41, 77, 266, 267].

#### **Student**

* [cite_start]**Course Enrollment**: Students can view and enroll in available courses[cite: 24, 58].
* **LMS Access**:
    * [cite_start]**View Activities**: Access course materials, assignments, and quizzes posted by teachers[cite: 30, 64].
    * [cite_start]**Submit Assignments**: Upload and submit completed assignments[cite: 326].
    * [cite_start]**View Attendance**: Check their attendance records for different courses[cite: 25, 59].
* [cite_start]**Mentee Profile**: View their mentor's details and communicate with them[cite: 29, 62, 314, 316].
* [cite_start]**Feedback**: Provide feedback on courses and teachers[cite: 26, 60].
* [cite_start]**Profile Management**: Manage their personal and academic profiles[cite: 27, 303].

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
| **`Backend/config/dbConfig.js`** | [cite_start]Configures the connection to the MongoDB database[cite: 11]. |
| **`Backend/controller`** | [cite_start]Contains the business logic for handling requests for different user roles (Admin, Teacher, Student)[cite: 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]. |
| **`Backend/routes`** | [cite_start]Defines the API routes for the application, mapping URLs to specific controller functions[cite: 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84]. |
| **`Backend/index.js`** | The main entry point for the backend server. [cite_start]It initializes the Express application, connects to the database, and sets up the API routes[cite: 45]. |
| **`client/src/App.js`** | The main component of the React application. [cite_start]It sets up the routing for different pages and components[cite: 273]. |
| **`client/src/api.js`** | [cite_start]Contains the functions for making API calls to the backend server[cite: 274]. |
| **`client/src/components`** | [cite_start]A collection of reusable React components used throughout the application, such as the Navbar, Dashboard, and various forms[cite: 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312]. |
| **`client/src/pages`** | Contains the main pages of the application, organized by user roles (Admin, Teacher, Student). [cite_start]Each page represents a specific feature or view within the application[cite: 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390]. |
| **`aitimetable/manage.py`** | [cite_start]A command-line utility that lets you interact with this Django project in various ways[cite: 236]. |
| **`aitimetable/projttgs/settings.py`** | [cite_start]Contains the settings and configuration for the Django project, including database setup, installed apps, and middleware[cite: 242]. |

