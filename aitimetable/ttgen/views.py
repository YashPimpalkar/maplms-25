from django.http import request
from django.shortcuts import render, redirect
from . forms import *
from .models import *
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
# from django.contrib.auth.decorators import #@login_required
from .render import Render
from django.views.generic import View
from django.core.cache import cache
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json

POPULATION_SIZE = 9
NUMB_OF_ELITE_SCHEDULES = 1
TOURNAMENT_SELECTION_SIZE = 3
MUTATION_RATE = 0.05

class Data:
    def __init__(self):
        self._rooms = Room.objects.all()
        self._meetingTimes = MeetingTime.objects.all()
        self._instructors = Instructor.objects.all()
        self._courses = Course.objects.all()
        self._depts = Department.objects.all()

    def get_rooms(self): return self._rooms

    def get_instructors(self): return self._instructors

    def get_courses(self): return self._courses

    def get_depts(self): return self._depts

    def get_meetingTimes(self): return self._meetingTimes


class Schedule:
    def __init__(self):
        self._data = data
        self._classes = []
        self._numberOfConflicts = 0
        self._fitness = -1
        self._classNumb = 0
        self._isFitnessChanged = True

    def get_classes(self):
        self._isFitnessChanged = True
        return self._classes

    def get_numbOfConflicts(self): return self._numberOfConflicts

    def get_fitness(self):
        if self._isFitnessChanged:
            self._fitness = self.calculate_fitness()
            self._isFitnessChanged = False
        return self._fitness

    def initialize(self):
        sections = Section.objects.all()
        for section in sections:
            dept = section.department
            n = section.num_class_in_week
            if n <= len(MeetingTime.objects.all()):
                courses = dept.courses.all()
                for course in courses:
                    for i in range(n // len(courses)):
                        crs_inst = course.instructors.all()
                        newClass = Class(self._classNumb, dept, section.section_id, course)
                        self._classNumb += 1
                        newClass.set_meetingTime(data.get_meetingTimes()[rnd.randrange(0, len(MeetingTime.objects.all()))])
                        newClass.set_room(data.get_rooms()[rnd.randrange(0, len(data.get_rooms()))])
                        newClass.set_instructor(crs_inst[rnd.randrange(0, len(crs_inst))])
                        self._classes.append(newClass)
            else:
                n = len(MeetingTime.objects.all())
                courses = dept.courses.all()
                for course in courses:
                    for i in range(n // len(courses)):
                        crs_inst = course.instructors.all()
                        newClass = Class(self._classNumb, dept, section.section_id, course)
                        self._classNumb += 1
                        newClass.set_meetingTime(data.get_meetingTimes()[rnd.randrange(0, len(MeetingTime.objects.all()))])
                        newClass.set_room(data.get_rooms()[rnd.randrange(0, len(data.get_rooms()))])
                        newClass.set_instructor(crs_inst[rnd.randrange(0, len(crs_inst))])
                        self._classes.append(newClass)

        return self

    # def calculate_fitness(self):
    #     self._numberOfConflicts = 0
    #     classes = self.get_classes()
    #     for i in range(len(classes)):
    #         if classes[i].room.seating_capacity < int(classes[i].course.max_numb_students):
    #             self._numberOfConflicts += 1
    #         for j in range(len(classes)):
    #             if j >= i:
    #                 if (classes[i].meeting_time == classes[j].meeting_time) and \
    #                         (classes[i].section_id != classes[j].section_id) and (classes[i].section == classes[j].section):
    #                     if classes[i].room == classes[j].room:
    #                         self._numberOfConflicts += 1
    #                     if classes[i].instructor == classes[j].instructor:
    #                         self._numberOfConflicts += 1
    #     return 1 / (1.0 * self._numberOfConflicts + 1)


    def calculate_fitness(self):
        self._numberOfConflicts = 0
        classes = self.get_classes()
        conflicts = []  # Store conflict details

        for i in range(len(classes)):
            # Capacity conflict
            if classes[i].room.seating_capacity < int(classes[i].course.max_numb_students):
                self._numberOfConflicts += 1
                conflicts.append(f"Room {classes[i].room.r_number} too small for {classes[i].course.course_name}.")

            for j in range(len(classes)):
                if j > i:  # Avoid duplicate checking
                    if (classes[i].meeting_time == classes[j].meeting_time) and (classes[i].section == classes[j].section):
                        
                        # Room conflict (Same room, same time)
                        if classes[i].room == classes[j].room:
                            self._numberOfConflicts += 1
                            conflicts.append(f"Room conflict: {classes[i].room.r_number} booked twice at {classes[i].meeting_time.time}.")

                        # Instructor conflict (Same instructor, same time)
                        if classes[i].instructor == classes[j].instructor:
                            self._numberOfConflicts += 1
                            conflicts.append(f"Instructor conflict: {classes[i].instructor.name} teaching {classes[i].course.course_name} and {classes[j].course.course_name} at {classes[i].meeting_time.time}.")

        # Print all conflicts
        for conflict in conflicts:
            print(conflict)

        return 1 / (1.0 * self._numberOfConflicts + 1)



    


class Population:
    def __init__(self, size):
        self._size = size
        self._data = data
        self._schedules = [Schedule().initialize() for i in range(size)]

    def get_schedules(self):
        return self._schedules


class GeneticAlgorithm:
    def evolve(self, population):
        return self._mutate_population(self._crossover_population(population))

    def _crossover_population(self, pop):
        crossover_pop = Population(0)
        for i in range(NUMB_OF_ELITE_SCHEDULES):
            crossover_pop.get_schedules().append(pop.get_schedules()[i])
        i = NUMB_OF_ELITE_SCHEDULES
        while i < POPULATION_SIZE:
            schedule1 = self._select_tournament_population(pop).get_schedules()[0]
            schedule2 = self._select_tournament_population(pop).get_schedules()[0]
            crossover_pop.get_schedules().append(self._crossover_schedule(schedule1, schedule2))
            i += 1
        return crossover_pop

    def _mutate_population(self, population):
        for i in range(NUMB_OF_ELITE_SCHEDULES, POPULATION_SIZE):
            self._mutate_schedule(population.get_schedules()[i])
        return population

    def _crossover_schedule(self, schedule1, schedule2):
        crossoverSchedule = Schedule().initialize()
        for i in range(0, len(crossoverSchedule.get_classes())):
            if rnd.random() > 0.5:
                crossoverSchedule.get_classes()[i] = schedule1.get_classes()[i]
            else:
                crossoverSchedule.get_classes()[i] = schedule2.get_classes()[i]
        return crossoverSchedule

    def _mutate_schedule(self, mutateSchedule):
        schedule = Schedule().initialize()
        for i in range(len(mutateSchedule.get_classes())):
            if MUTATION_RATE > rnd.random():
                mutateSchedule.get_classes()[i] = schedule.get_classes()[i]
        return mutateSchedule

    def _select_tournament_population(self, pop):
        tournament_pop = Population(0)
        i = 0
        while i < TOURNAMENT_SELECTION_SIZE:
            tournament_pop.get_schedules().append(pop.get_schedules()[rnd.randrange(0, POPULATION_SIZE)])
            i += 1
        tournament_pop.get_schedules().sort(key=lambda x: x.get_fitness(), reverse=True)
        return tournament_pop


class Class:
    def __init__(self, id, dept, section, course):
        self.section_id = id
        self.department = dept
        self.course = course
        self.instructor = None
        self.meeting_time = None
        self.room = None
        self.section = section

    def get_id(self): return self.section_id

    def get_dept(self): return self.department

    def get_course(self): return self.course

    def get_instructor(self): return self.instructor

    def get_meetingTime(self): return self.meeting_time

    def get_room(self): return self.room

    def set_instructor(self, instructor): self.instructor = instructor

    def set_meetingTime(self, meetingTime): self.meeting_time = meetingTime

    def set_room(self, room): self.room = room


data = Data()


def context_manager(schedule):
    classes = schedule.get_classes()
    context = []
    
    for i in range(len(classes)):
        # Create a new dictionary for each class
        cls = {
            "section": classes[i].section_id,
            "dept": classes[i].department.dept_name,
            "course": f'{classes[i].course.course_name} ({classes[i].course.course_number}, {classes[i].course.max_numb_students})',
            "room": f'{classes[i].room.r_number} ({classes[i].room.seating_capacity})',
            "instructor": f'{classes[i].instructor.name} ({classes[i].instructor.uid})',
            "meeting_time": [classes[i].meeting_time.pid, classes[i].meeting_time.day, classes[i].meeting_time.time]
        }
        context.append(cls)
    
    return context

@api_view(['GET'])
def timetable(request):
    # Clear any previous progress
    cache.set('timetable_progress', {"generation": 0, "fitness": 0}, timeout=None)
    
    # Initialize population
    population = Population(POPULATION_SIZE)
    generation_num = 0
    population.get_schedules().sort(key=lambda x: x.get_fitness(), reverse=True)
    geneticAlgorithm = GeneticAlgorithm()
    
    # Set a maximum number of generations to prevent infinite loops
    MAX_GENERATIONS = 1000
    
    while population.get_schedules()[0].get_fitness() != 1.0 and generation_num < MAX_GENERATIONS:
        generation_num += 1
        fitness_value = population.get_schedules()[0].get_fitness()
        print(f'\n> Generation #{generation_num} | Fitness: {fitness_value:.4f}')
        
        # Update progress in cache
        # cache.set('timetable_progress', {"generation": generation_num, "fitness": fitness_value}, timeout=None)
        
        # Evolve population
        population = geneticAlgorithm.evolve(population)
        population.get_schedules().sort(key=lambda x: x.get_fitness(), reverse=True)
        print(population.get_schedules()[0])
        generation_data = context_manager(population.get_schedules()[0])
        sections_data = {}
        for cls in generation_data:
            section_id = cls["section"]
            if section_id not in sections_data:
                sections_data[section_id] = []
            sections_data[section_id].append(cls)
        print(generation_data)
        cache.set('timetable_progress', {"generation": generation_num, "fitness": fitness_value,"generation_data":generation_data}, timeout=None)


    # Get the best schedule
    final_schedule = population.get_schedules()[0]
    
    # Final progress update
    final_fitness = final_schedule.get_fitness()
    cache.set('timetable_progress', {"generation": generation_num, "fitness": 1}, timeout=None)
    
    # Convert schedule to response format
    schedule_data = context_manager(final_schedule)
    
    # Store the full timetable in cache for other API endpoints
    cache.set('full_timetable', schedule_data, timeout=None)
    
    # Group classes by section for easier frontend rendering
    sections_data = {}
    for cls in schedule_data:
        section_id = cls["section"]
        if section_id not in sections_data:
            sections_data[section_id] = []
        sections_data[section_id].append(cls)
    print(schedule_data)

    return Response({
        "generation": generation_num,
        "fitness": final_fitness,
        "schedule": schedule_data,
        "sections": sections_data,
        "completed": final_fitness == 1.0 or generation_num >= MAX_GENERATIONS
    })
############################################################################


def index(request):
    return render(request, 'index.html', {})


def about(request):
    return render(request, 'aboutus.html', {})


def help(request):
    return render(request, 'help.html', {})


def terms(request):
    return render(request, 'terms.html', {})


def contact(request):
    if request.method == 'POST':
        message = request.POST['message']

        send_mail('TTGS Contact',
                  message,
                  settings.EMAIL_HOST_USER,
                  ['codevoid12@gmail.com'],
                  fail_silently=False)
    return render(request, 'contact.html', {})

#################################################################################

@api_view(['GET'])
def get_timetable_progress(request):
    progress = cache.get('timetable_progress', {"generation": 0, "fitness": 0})
    return Response(progress)



#@login_required
def admindash(request):
    return render(request, 'admindashboard.html', {})

#################################################################################

# #@login_required
# def addCourses(request):
#     form = CourseForm(request.POST or None)
#     if request.method == 'POST':
#         if form.is_valid():
#             form.save()
#             return redirect('addCourses')
#         else:
#             print('Invalid')
#     context = {
#         'form': form
#     }
#     return render(request, 'addCourses.html', context)

# #@login_required
# def course_list_view(request):
#     context = {
#         'courses': Course.objects.all()
#     }
#     return render(request, 'courseslist.html', context)

# #@login_required
# def delete_course(request, pk):
#     crs = Course.objects.filter(pk=pk)
#     if request.method == 'POST':
#         crs.delete()
#         return redirect('editcourse')



# Serializer function
def serialize_course(course):
    return {
        "course_number": course.course_number,
        "course_name": course.course_name,
        "max_numb_students": course.max_numb_students,
        "instructors": [inst.name for inst in course.instructors.all()]
    }

# ✅ Add Course (POST)
@api_view(["POST"])
def add_course_api(request):
    course_number = request.data.get("course_number")
    course_name = request.data.get("course_name")
    max_numb_students = request.data.get("max_numb_students")
    instructor_ids = request.data.get("instructors", [])

    if not course_number or not course_name or not max_numb_students:
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if Course.objects.filter(course_number=course_number).exists():
        return Response({"error": "Course with this number already exists"}, status=status.HTTP_400_BAD_REQUEST)

    course = Course.objects.create(course_number=course_number, course_name=course_name, max_numb_students=max_numb_students)

    # Add instructors
    instructors = Instructor.objects.filter(id__in=instructor_ids)
    course.instructors.set(instructors)

    return Response(
        {"message": "Course added successfully!", "course": serialize_course(course)},
        status=status.HTTP_201_CREATED,
    )

# ✅ Get Course List (GET)
@api_view(['GET'])
def course_list_view(request):
    courses = Course.objects.all()
    data = [serialize_course(crs) for crs in courses]
    return Response(data, status=status.HTTP_200_OK)

# ✅ Delete Course (DELETE)
@api_view(['DELETE'])
def delete_course(request, pk):
    course = get_object_or_404(Course, pk=pk)
    course.delete()
    return Response({'message': 'Course deleted successfully!'}, status=status.HTTP_200_OK)

#################################################################################



# ✅ Manual Serialization for Instructor
def serialize_instructor(instructor):
    return {
        "id": instructor.id,
        "uid": instructor.uid,
        "name": instructor.name
    }


@api_view(["POST"])  # ✅ Change from "GET" to "POST"
def add_instructor_api(request):
    uid = request.data.get("uid")
    name = request.data.get("name")

    if not uid or not name:
        return Response({"error": "Both UID and Name are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate UID
    if Instructor.objects.filter(uid=uid).exists():
        return Response({"error": "Instructor with this UID already exists"}, status=status.HTTP_400_BAD_REQUEST)

    instructor = Instructor.objects.create(uid=uid, name=name)
    return Response(
        {
            "message": "Instructor added successfully!",
            "instructor": {
                "id": instructor.id,
                "uid": instructor.uid,
                "name": instructor.name,
            },
        },
        status=status.HTTP_201_CREATED,
    )
# ✅ Get Instructor List (GET)
@api_view(['GET'])
def api_instructor_list(request):
    instructors = Instructor.objects.all()
    data = [serialize_instructor(inst) for inst in instructors]
    return Response(data, status=status.HTTP_200_OK)

# ✅ Delete Instructor (DELETE)
@api_view(['DELETE'])
def api_delete_instructor(request, pk):
    instructor = get_object_or_404(Instructor, pk=pk)
    instructor.delete()
    return Response({'message': 'Instructor deleted successfully!'}, status=status.HTTP_200_OK)  # Changed status to 200

#################################################################################

# ✅ Serialize Room Data
def serialize_room(room):
    return {
        "id": room.id,
        "r_number": room.r_number,
        "seating_capacity": room.seating_capacity
    }
#@login_required
# def addRooms(request):
#     form = RoomForm(request.POST or None)
#     if request.method == 'POST':
#         if form.is_valid():
#             form.save()
#             return redirect('addRooms')
#     context = {
#         'form': form
#     }
#     return render(request, 'addRooms.html', context)

@api_view(["POST"])
def add_room_api(request):
    r_number = request.data.get("r_number")
    seating_capacity = request.data.get("seating_capacity")

    if not r_number or seating_capacity is None:
        return Response({"error": "Room Number and Seating Capacity are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Check for duplicate room number
    if Room.objects.filter(r_number=r_number).exists():
        return Response({"error": "Room with this number already exists"}, status=status.HTTP_400_BAD_REQUEST)

    room = Room.objects.create(r_number=r_number, seating_capacity=seating_capacity)
    return Response(
        {
            "message": "Room added successfully!",
            "room": serialize_room(room),
        },
        status=status.HTTP_201_CREATED,
    )

#@login_required
# def room_list(request):
#     context = {
#         'rooms': Room.objects.all()
#     }
#     return render(request, 'roomslist.html', context)

@api_view(["GET"])
def api_room_list(request):
    rooms = Room.objects.all()
    data = [serialize_room(room) for room in rooms]
    return Response(data, status=status.HTTP_200_OK)


#@login_required
# def delete_room(request, pk):
#     rm = Room.objects.filter(pk=pk)
#     if request.method == 'POST':
#         rm.delete()
#         return redirect('editrooms')
@api_view(["DELETE"])
def api_delete_room(request, pk):
    room = get_object_or_404(Room, pk=pk)
    room.delete()
    return Response({'message': 'Room deleted successfully!'}, status=status.HTTP_200_OK)


#################################################################################

# #@login_required
# def addTimings(request):
#     form = MeetingTimeForm(request.POST or None)
#     if request.method == 'POST':
#         if form.is_valid():
#             form.save()
#             return redirect('addTimings')
#         else:
#             print('Invalid')
#     context = {
#         'form': form
#     }
#     return render(request, 'addTimings.html', context)

# #@login_required
# def meeting_list_view(request):
#     context = {
#         'meeting_times': MeetingTime.objects.all()
#     }
#     return render(request, 'mtlist.html', context)

# #@login_required
# def delete_meeting_time(request, pk):
#     mt = MeetingTime.objects.filter(pk=pk)
#     if request.method == 'POST':
#         mt.delete()
#         return redirect('editmeetingtime')


def serialize_meeting_time(meeting_time):
    return {
        "pid": meeting_time.pid,
        "day": meeting_time.day,
        "time": meeting_time.time,
    }

# ✅ Add Meeting Time (POST)
@api_view(["POST"])
def add_meeting_time(request):
    pid = request.data.get("pid")
    day = request.data.get("day")
    time = request.data.get("time")

    if not pid or not day or not time:
        return Response({"error": "All fields (PID, Day, Time) are required"}, status=status.HTTP_400_BAD_REQUEST)

    if MeetingTime.objects.filter(pid=pid).exists():
        return Response({"error": "Meeting with this PID already exists"}, status=status.HTTP_400_BAD_REQUEST)

    meeting_time = MeetingTime.objects.create(pid=pid, day=day, time=time)
    return Response(
        {"message": "Meeting time added successfully!", "meeting_time": serialize_meeting_time(meeting_time)},
        status=status.HTTP_201_CREATED,
    )

# ✅ Get Meeting Time List (GET)
@api_view(['GET'])
def meeting_list_view(request):
    meetings = MeetingTime.objects.all()
    data = [serialize_meeting_time(mt) for mt in meetings]
    return Response(data, status=status.HTTP_200_OK)

# ✅ Delete Meeting Time (DELETE)
@api_view(['DELETE'])
def delete_meeting_time(request, pk):
    meeting = get_object_or_404(MeetingTime, pk=pk)
    meeting.delete()
    return Response({'message': 'Meeting time deleted successfully!'}, status=status.HTTP_200_OK)

#################################################################################

# #@login_required
# def addDepts(request):
#     form = DepartmentForm(request.POST or None)
#     if request.method == 'POST':
#         if form.is_valid():
#             form.save()
#             return redirect('addDepts')
#     context = {
#         'form': form
#     }
#     return render(request, 'addDepts.html', context)

# #@login_required
# def department_list(request):
#     context = {
#         'departments': Department.objects.all()
#     }
#     return render(request, 'deptlist.html', context)

# #@login_required
# def delete_department(request, pk):
#     dept = Department.objects.filter(pk=pk)
#     if request.method == 'POST':
#         dept.delete()
#         return redirect('editdepartment')

def serialize_department(dept):
    return {
        "dept_name": dept.dept_name,
        "courses": [{"course_number": course.course_number, "course_name": course.course_name} 
                   for course in dept.courses.all()]
    }

# ✅ Add Department (POST)
@api_view(["POST"])
def add_department_api(request):
    try:
        # Get data from request
        dept_name = request.data.get("dept_name")
        course_numbers = request.data.get("courses", [])
        
        # Validate department name
        if not dept_name:
            return Response({"error": "Department name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the department
        department, created = Department.objects.get_or_create(dept_name=dept_name)

        # Handle course associations if provided
        if course_numbers:
            # Find courses by course_number instead of ID
            courses = []
            missing_numbers = []
            
            for course_number in course_numbers:
                course = Course.objects.filter(course_number=course_number).first()
                if course:
                    courses.append(course)
                else:
                    missing_numbers.append(course_number)
            
            # Check if all requested courses exist
            if missing_numbers:
                return Response(
                    {"error": f"Some course numbers were not found: {missing_numbers}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            department.courses.set(courses)

        # Return success response with department data
        return Response(
            {
                "message": "Department added successfully!", 
                "department": serialize_department(department)
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Error in add_department_api: {str(e)}")
        return Response(
            {"error": "An unexpected error occurred", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    try:
        # Get data from request
        dept_name = request.data.get("dept_name")
        course_ids = request.data.get("courses", [])
        
        # Validate department name
        if not dept_name:
            return Response({"error": "Department name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the department
        department, created = Department.objects.get_or_create(dept_name=dept_name)

        # Handle course associations if provided
        if course_ids:
            # Convert course_ids to integers if they're not already
            try:
                # Handle both string IDs and integer IDs
                if isinstance(course_ids, list):
                    course_ids = [int(cid) if isinstance(cid, str) else cid for cid in course_ids]
                else:
                    # If a single value was provided
                    course_ids = [int(course_ids)]
            except ValueError:
                return Response({"error": "Invalid course IDs format. Expected integers."}, 
                               status=status.HTTP_400_BAD_REQUEST)

            # Fetch courses and associate them with the department
            courses = Course.objects.filter(id__in=course_ids)
            
            # Check if all requested courses exist
            if len(courses) != len(course_ids):
                found_ids = [course.id for course in courses]
                missing_ids = [cid for cid in course_ids if cid not in found_ids]
                return Response(
                    {"error": f"Some course IDs were not found: {missing_ids}"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            department.courses.set(courses)

        # Return success response with department data
        return Response(
            {
                "message": "Department added successfully!", 
                "department": serialize_department(department)
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        # Log the error for debugging
        print(f"Error in add_department_api: {str(e)}")
        return Response(
            {"error": "An unexpected error occurred", "details": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# ✅ Get Department List (GET)
@api_view(['GET'])
def department_list_view(request):
    departments = Department.objects.all()
    data = [serialize_department(dept) for dept in departments]
    return Response(data, status=status.HTTP_200_OK)

# ✅ Delete Department (DELETE)
# @api_view(['DELETE'])
# def delete_department(request, pk):
#     department = get_object_or_404(Department, pk=pk)
#     department.delete()
#     return Response({'message': 'Department deleted successfully!'}, status=status.HTTP_200_OK)
@api_view(['DELETE'])
def delete_department(request, dept_name):
    departments = Department.objects.filter(dept_name=dept_name)
    
    if not departments.exists():
        return Response({'error': f'Department "{dept_name}" not found!'}, status=status.HTTP_404_NOT_FOUND)

    count, _ = departments.delete()  # Deletes all matching departments
    return Response({'message': f'{count} department(s) named "{dept_name}" deleted successfully!'}, status=status.HTTP_200_OK)


#################################################################################

#@login_required
# def addSections(request):
#     form = SectionForm(request.POST or None)
#     if request.method == 'POST':
#         if form.is_valid():
#             form.save()
#             return redirect('addSections')
#     context = {
#         'form': form
#     }
#     return render(request, 'addSections.html', context)

# #@login_required
# def section_list(request):
#     context = {
#         'sections': Section.objects.all()
#     }
#     return render(request, 'seclist.html', context)

# #@login_required
# def delete_section(request, pk):
#     sec = Section.objects.filter(pk=pk)
#     if request.method == 'POST':
#         sec.delete()
#         return redirect('editsection')



# ✅ Serialize Section (Manual)
def serialize_section(section):
    return {
        "section_id": section.section_id,
        "department": section.department.dept_name,
        "num_class_in_week": section.num_class_in_week,
        "course": section.course.course_name if section.course else None,
        "instructor": section.instructor.name if section.instructor else None,
        "room": section.room.r_number if section.room else None,  # Changed from room_name to r_number
        "meeting_time": section.meeting_time.time if section.meeting_time else None,
    }

# ✅ Get All Sections
@api_view(["GET"])
def api_section_list(request):
    sections = Section.objects.all()
    print(sections)
    data = [serialize_section(sec) for sec in sections]
    print(data)
    return Response(data, status=status.HTTP_200_OK)

# ✅ Add Section
# ✅ Add Section
@api_view(["POST"])
def add_section_api(request):
    data = request.data
    section_id = data.get("section_id")
    department_name = data.get("department")
    num_class_in_week = data.get("num_class_in_week")

    # Print received data for debugging
    print(f"Received section data: {data}")

    # Validate required fields
    if not section_id or not department_name or not num_class_in_week:
        return Response({"error": "section_id, department, and num_class_in_week are required"}, 
                       status=status.HTTP_400_BAD_REQUEST)

    # Get department or return 404
    department = get_object_or_404(Department, dept_name=department_name)
    
    # Get optional related objects - handle both ID and name/display values
    course_value = data.get("course")
    instructor_value = data.get("instructor")
    room_value = data.get("room")
    meeting_time_value = data.get("meeting_time")
    
    # Try to find course by course_number or course_name
    course = None
    if course_value:
        course = Course.objects.filter(course_number=course_value).first()
        if not course:
            course = Course.objects.filter(course_name=course_value).first()
    
    # Try to find instructor by uid or name
    instructor = None
    if instructor_value:
        instructor = Instructor.objects.filter(uid=instructor_value).first()
        if not instructor:
            instructor = Instructor.objects.filter(name=instructor_value).first()
    
    # Try to find room by r_number
    room = None
    if room_value:
        room = Room.objects.filter(r_number=room_value).first()
    
    # Try to find meeting time by pid or time
    meeting_time = None
    if meeting_time_value:
        meeting_time = MeetingTime.objects.filter(pid=meeting_time_value).first()
        if not meeting_time:
            meeting_time = MeetingTime.objects.filter(time=meeting_time_value).first()

    section = Section.objects.create(
        section_id=section_id,
        department=department,
        num_class_in_week=num_class_in_week,
        course=course,
        instructor=instructor,
        room=room,
        meeting_time=meeting_time
    )

    return Response({"message": "Section added successfully!", "section": serialize_section(section)}, 
                   status=status.HTTP_201_CREATED)
@api_view(["DELETE"])
def api_delete_section(request, pk):
    section = get_object_or_404(Section, pk=pk)
    section.delete()
    return Response({"message": "Section deleted successfully!"}, status=status.HTTP_200_OK)


#################################################################################

#@login_required
def generate(request):
    return render(request, 'generate.html', {})

#################################################################################

class Pdf(View):
    def get(self, request):
        params = {
            'request': request
        }
        return Render.render('gentimetable.html', params)


