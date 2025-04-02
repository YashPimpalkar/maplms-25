from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('about', views.about, name='about'),
    path('help', views.help, name='help'),
    path('terms', views.terms, name='terms'),
    path('contact', views.contact, name='contact'),

    path('admin_dashboard', views.admindash, name='admindash'),

  
    path('api/addinstructor/', views.add_instructor_api, name='add_instructor_api'),
    path('api/instructors/', views.api_instructor_list, name='api_instructor_list'),
    path('api/instructors/delete/<int:pk>/', views.api_delete_instructor, name='api_delete_instructor'),
    # path('add_teachers', views.addInstructor, name='addInstructors'),
    # path('teachers_list/', views.inst_list_view , name='editinstructor'),
    # path('delete_teacher/<int:pk>/', views.delete_instructor, name='deleteinstructor'),
    path("api/rooms/add/", views.add_room_api, name="add_room_api"),
    path("api/rooms/", views.api_room_list, name="api_room-list"),
    path("api/rooms/delete/<int:pk>/", views.api_delete_room ,name="api_delete_room"),

    # path('add_rooms', views.addRooms, name='addRooms'),
    # path('rooms_list/', views.room_list, name='editrooms'),
    # path('delete_room/<int:pk>/', views.delete_room, name='deleteroom'),

    # path('add_timings', views.addTimings, name='addTimings'),
    # path('timings_list/', views.meeting_list_view, name='editmeetingtime'),
    # path('delete_meetingtime/<str:pk>/', views.delete_meeting_time, name='deletemeetingtime'),
    path("api/meeting-times/add/", views.add_meeting_time, name="add_meeting_time"),
    path("api/meeting-times/", views.meeting_list_view, name="meeting_list"),
    path("api/meeting-times/delete/<str:pk>/", views.delete_meeting_time, name="delete_meeting_time"),

    # path('add_courses', views.addCourses, name='addCourses'),
    # path('courses_list/', views.course_list_view, name='editcourse'),
    # path('delete_course/<str:pk>/', views.delete_course, name='deletecourse'),
    path("api/courses/add/", views.add_course_api, name="add_course"),
    path("api/courses/",views.course_list_view, name="course_list"),
    path("api/courses/delete/<str:pk>/", views.delete_course, name="delete_course"),

    # path('add_departments', views.addDepts, name='addDepts'),
    # path('departments_list/', views.department_list, name='editdepartment'),
    # path('delete_department/<int:pk>/', views.delete_department, name='deletedepartment'),
    path("api/departments/add/", views.add_department_api, name="add_department"),
    path("api/departments/", views.department_list_view, name="department_list"),
    # path("api/departments/delete/<int:pk>/", views.delete_department, name="delete_department"),
    path("api/departments/delete/<str:dept_name>/", views.delete_department, name="delete_department"),


    # path('add_sections', views.addSections, name='addSections'),
    # path('sections_list/', views.section_list, name='editsection'),
    # path('delete_section/<str:pk>/', views.delete_section, name='deletesection'),
    path("api/sections/", views.api_section_list, name="api_section_list"),
    path("api/sections/add/", views.add_section_api, name="add_section_api"),
    path("api/sections/delete/<str:pk>/", views.api_delete_section, name="delete_section_api"),

    path('generate_timetable', views.generate, name='generate'),

    path('timetable_generation/', views.timetable, name='timetable'),
    path('timetable_generation/render/pdf', views.Pdf.as_view, name='pdf'),
    path('api/timetable/progress/', views.get_timetable_progress, name='get_timetable_progress'),

]
