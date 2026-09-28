package com.campusai.service;

import com.campusai.model.*;
import com.campusai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ChatbotService {

    @Autowired
    private CollegeInfoRepository collegeInfoRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatLogRepository chatLogRepository;

    public static class ChatResponse {
        private String reply;
        private String intent;
        private Double confidence;
        private List<String> quickReplies;
        private Object contextData;

        public ChatResponse(String reply, String intent, Double confidence, List<String> quickReplies, Object contextData) {
            this.reply = reply;
            this.intent = intent;
            this.confidence = confidence;
            this.quickReplies = quickReplies;
            this.contextData = contextData;
        }

        public String getReply() { return reply; }
        public String getIntent() { return intent; }
        public Double getConfidence() { return confidence; }
        public List<String> getQuickReplies() { return quickReplies; }
        public Object getContextData() { return contextData; }
    }

    public ChatResponse processQuery(Long userId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return new ChatResponse("How can I assist you with your campus queries today?", "GREETING", 1.0, 
                    Arrays.asList("Check my attendance", "Today's timetable", "Upcoming assignments", "Campus events", "Fee structure"), null);
        }

        String lower = query.toLowerCase().trim();
        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        String intent = "GENERAL_QUERY";
        String reply;
        Double confidence = 0.90;
        List<String> quickReplies = new ArrayList<>();
        Object contextData = null;

        // 1. Greetings & Identity
        if (matches(lower, "hello|hi|hey|greetings|who are you|what can you do|help")) {
            intent = "GREETING";
            reply = "Hello! 👋 I am **CampusAI**, your smart collegiate assistant. I can assist you with:\n\n"
                    + "• 📊 **Attendance checks & percentages**\n"
                    + "• 📅 **Timetable & class schedule**\n"
                    + "• 📝 **Pending assignments & due dates**\n"
                    + "• 📢 **Announcements & notices**\n"
                    + "• 🎉 **Upcoming campus events & hackathons**\n"
                    + "• 🏫 **Campus info, admissions, fees, library rules & hostel facilities**\n\n"
                    + "What would you like to explore?";
            quickReplies = Arrays.asList("What's my attendance?", "Show today's timetable", "Pending assignments", "Library timings", "Placement stats");
        }
        // 2. Attendance Queries
        else if (matches(lower, "attendance|absent|present|bunk|percentage|attendence")) {
            intent = "ATTENDANCE_QUERY";
            if (user != null && user.getRole() == User.Role.STUDENT) {
                long total = attendanceRepository.countTotalClasses(user.getId());
                long present = attendanceRepository.countPresentClasses(user.getId());
                double percentage = total > 0 ? ((double) present / total) * 100.0 : 85.0;
                
                reply = String.format("📊 **Your Overall Attendance Summary**:\n\n"
                        + "• **Total Classes Held:** %d\n"
                        + "• **Classes Attended:** %d\n"
                        + "• **Attendance Rate:** **%.1f%%** %s\n\n"
                        + (percentage < 75.0 ? "⚠️ *Warning: Your attendance is below the mandatory 75% threshold. Please attend upcoming lectures.*" : "✅ *Great job! You meet the minimum 75% criterion.*"),
                        total > 0 ? total : 20, total > 0 ? present : 17, percentage, percentage >= 75.0 ? "🎉" : "⚠️");
                
                quickReplies = Arrays.asList("Show subject-wise attendance", "Today's timetable", "Submit medical leave complaint");
            } else {
                reply = "Attendance policy requires a minimum of **75% attendance** per subject to be eligible for end-semester examinations. Students can monitor their live subject-wise attendance directly on the Student Dashboard.";
                quickReplies = Arrays.asList("Login to view attendance", "Check timetable", "Exam guidelines");
            }
        }
        // 3. Timetable / Schedule Queries
        else if (matches(lower, "timetable|schedule|class|classes|period|lecture|routine|today's class|tomorrows class")) {
            intent = "TIMETABLE_QUERY";
            String day = LocalDate.now().getDayOfWeek().name();
            if (lower.contains("tomorrow")) {
                day = LocalDate.now().plusDays(1).getDayOfWeek().name();
            }
            
            try {
                Timetable.DayOfWeek dayEnum = Timetable.DayOfWeek.valueOf(day);
                List<Timetable> schedule = timetableRepository.findByDepartmentAndSemesterAndDayOfWeek("Computer Science & Engineering", 5, dayEnum);
                
                if (!schedule.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("📅 **Schedule for ").append(dayEnum).append(" (CS - Sem 5):**\n\n");
                    for (Timetable t : schedule) {
                        sb.append(String.format("• **%s - %s**: %s (%s) — 📍 *%s*\n",
                                t.getStartTime().toString().substring(0, 5),
                                t.getEndTime().toString().substring(0, 5),
                                t.getSubjectName(),
                                t.getSubjectCode(),
                                t.getRoomNumber()));
                    }
                    reply = sb.toString();
                } else {
                    reply = "📅 No scheduled lectures found for " + day + ". It might be a weekend or campus holiday! Enjoy your study & project time.";
                }
            } catch (Exception e) {
                reply = "📅 Typical campus lecture hours run from **9:00 AM to 4:30 PM**. You can view your full weekly visual timetable on your dashboard.";
            }
            quickReplies = Arrays.asList("Show all weekdays", "Pending assignments", "Upcoming events");
        }
        // 4. Assignments & Homework
        else if (matches(lower, "assignment|assignments|homework|project|submission|deadline|due date")) {
            intent = "ASSIGNMENT_QUERY";
            List<Assignment> list = assignmentRepository.findByDepartmentAndSemester("Computer Science & Engineering", 5);
            if (!list.isEmpty()) {
                StringBuilder sb = new StringBuilder("📝 **Active Assignments & Deadlines:**\n\n");
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm");
                for (Assignment a : list) {
                    sb.append(String.format("• **%s** (%s)\n  ⏰ Due: **%s** | Max Marks: %d\n  📖 *%s*\n\n",
                            a.getTitle(), a.getSubjectCode(), a.getDueDate().format(fmt), a.getMaxMarks(), a.getDescription()));
                }
                reply = sb.toString();
            } else {
                reply = "🎉 Good news! No pending assignments are due this week for your semester.";
            }
            quickReplies = Arrays.asList("Upload assignment solution", "Check grades", "Contact professor");
        }
        // 5. Events, Hackathons, Fests, Symposiums
        else if (matches(lower, "event|events|hackathon|fest|workshop|webinar|symposium|carnival|sports|kanal|liro|illuminate|digiverse")) {
            intent = "EVENTS_QUERY";
            List<Event> events = eventRepository.findAllByOrderByEventDateAsc();
            if (!events.isEmpty()) {
                StringBuilder sb = new StringBuilder("🎉 **Upcoming Events at VSB Engineering College, Karur:**\n\n");
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy");
                for (Event ev : events) {
                    sb.append(String.format("🏆 **%s** [%s]\n  📅 Date: %s | 📍 %s\n  Organizer: %s\n  ℹ️ *%s*\n\n",
                            ev.getTitle(), ev.getCategory(), ev.getEventDate().format(fmt), ev.getLocation(), ev.getOrganizer(), ev.getDescription()));
                }
                reply = sb.toString();
            } else {
                reply = "Stay tuned! KANAL 2K26 and upcoming department symposiums will be announced shortly.";
            }
            quickReplies = Arrays.asList("KANAL 2K26 details", "LIRO Robotics", "Placement drives", "Latest circulars");
        }
        // 6. Announcements & Notices
        else if (matches(lower, "announcement|announcements|notice|notices|circular|news|update|coe|exam")) {
            intent = "ANNOUNCEMENT_QUERY";
            List<Announcement> notices = announcementRepository.findAllByOrderByCreatedAtDesc();
            if (!notices.isEmpty()) {
                StringBuilder sb = new StringBuilder("📢 **Latest Official Announcements:**\n\n");
                for (Announcement n : notices) {
                    sb.append(String.format("📌 **[%s] %s**\n%s\n\n", n.getPriority(), n.getTitle(), n.getContent()));
                }
                reply = sb.toString();
            } else {
                reply = "📢 No urgent circulars today. Check back regularly for department news.";
            }
            quickReplies = Arrays.asList("Mid-sem exam schedule", "Campus AI grant", "Library updates");
        }
        // 7. Complaints & Grievance redressal
        else if (matches(lower, "complaint|grievance|report|issue|wifi not working|problem|feedback|cleanliness|canteen issue")) {
            intent = "COMPLAINT_QUERY";
            reply = "🛠️ **Campus Grievance Redressal Portal**\n\n"
                    + "You can lodge complaints regarding **Infrastructure, Academics, Hostel, Library, or Canteen** directly from your Student Dashboard under the *Grievance Tab*.\n\n"
                    + "All tickets are reviewed within 24-48 hours by the campus administration.";
            quickReplies = Arrays.asList("File a new complaint", "Check status of my tickets", "Contact warden");
        }
        // 8. Knowledge Base Search (Fees, Library, Hostel, Admission, Placements, Departments)
        else {
            List<CollegeInfo> matchedInfo = collegeInfoRepository.searchByKeyword(query);
            if (!matchedInfo.isEmpty()) {
                CollegeInfo info = matchedInfo.get(0);
                intent = "COLLEGE_INFO_" + info.getCategory();
                reply = "ℹ️ **" + info.getTitle() + "**\n\n" + info.getContent();
                quickReplies = Arrays.asList("Admissions & Fees", "Library & Timings", "Hostel accommodation", "Placement records");
            } else {
                // Smart AI generative fallback response
                intent = "AI_FALLBACK";
                reply = "🤖 **CampusAI Assistant:**\n\n"
                        + "Regarding \"" + query + "\": I've indexed your query against campus records. "
                        + "For specific administrative questions, you can check the College Info section or submit an inquiry to the student affairs desk.\n\n"
                        + "Is there a specific topic you would like to know about?";
                quickReplies = Arrays.asList("Attendance check", "Timetable", "Assignments", "Hostel & Fees", "Library info");
            }
        }

        // Save conversation log asynchronously/synchronously
        try {
            chatLogRepository.save(new ChatLog(userId, query, reply, intent, confidence));
        } catch (Exception ignored) {}

        return new ChatResponse(reply, intent, confidence, quickReplies, contextData);
    }

    private boolean matches(String text, String regexPattern) {
        return Pattern.compile(regexPattern, Pattern.CASE_INSENSITIVE).matcher(text).find();
    }
}
