/**
 * CampusAI - Smart AI Chatbot Assistant Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initChatbot();
});

function initChatbot() {
  // If chatbot markup doesn't exist on page, inject it automatically
  if (!document.getElementById('campusai-chatbot')) {
    injectChatbotMarkup();
  }

  const launcher = document.getElementById('chat-launcher');
  const container = document.getElementById('chat-container');
  const closeBtn = document.getElementById('chat-close-btn');
  const clearBtn = document.getElementById('chat-clear-btn');
  const sendBtn = document.getElementById('chat-send-btn');
  const voiceBtn = document.getElementById('chat-voice-btn');
  const input = document.getElementById('chat-input');
  const messagesBox = document.getElementById('chat-messages');
  const quickRepliesBox = document.getElementById('chat-quick-replies');

  if (!launcher || !container) return;

  // Toggle Chatbot
  launcher.addEventListener('click', () => {
    container.classList.toggle('open');
    if (container.classList.contains('open')) {
      input.focus();
    }
  });

  closeBtn.addEventListener('click', () => {
    container.classList.remove('open');
  });

  clearBtn.addEventListener('click', () => {
    messagesBox.innerHTML = '';
    appendBotMessage("Hello! 👋 Chat history cleared. How else can I assist your campus life today?");
    renderQuickReplies(["Check my attendance", "Today's timetable", "Upcoming assignments", "Campus events", "Fee structure"]);
  });

  // Send message
  function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = '';
    quickRepliesBox.innerHTML = '';

    // Show typing animation
    const typingIndicator = showTypingIndicator();

    // Query API or local AI engine
    const user = AuthState.getUser();
    
    setTimeout(async () => {
      try {
        let response = await apiRequest('/chatbot/query', 'POST', {
          userId: user ? user.id : null,
          query: text
        });

        // If local fallback response
        if (!response || !response.reply) {
          response = processClientSideAI(text, user);
        }

        typingIndicator.remove();
        appendBotMessage(response.reply);
        
        if (response.quickReplies && response.quickReplies.length) {
          renderQuickReplies(response.quickReplies);
        }
      } catch (err) {
        typingIndicator.remove();
        const fallback = processClientSideAI(text, user);
        appendBotMessage(fallback.reply);
        renderQuickReplies(fallback.quickReplies);
      }
    }, 600);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  });

  // Voice Input (Web Speech API)
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
      try {
        voiceBtn.classList.add('listening');
        showToast('Listening... Speak now 🎙️', 'info');
        recognition.start();
      } catch (err) {
        voiceBtn.classList.remove('listening');
      }
    });

    recognition.onresult = (event) => {
      voiceBtn.classList.remove('listening');
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      handleSend();
    };

    recognition.onerror = () => {
      voiceBtn.classList.remove('listening');
      showToast('Voice recognition canceled or unavailable.', 'error');
    };

    recognition.onend = () => {
      voiceBtn.classList.remove('listening');
    };
  } else {
    voiceBtn.style.display = 'none';
  }

  // Initial welcome message
  appendBotMessage("Hello! 👋 I am **CampusAI Assistant**.\n\nI can help you check **attendance**, view **timetables**, look up **assignments**, find **events & circulars**, or answer any college questions!");
  renderQuickReplies(["What's my attendance?", "Today's timetable", "Pending assignments", "Library timings", "Fee structure"]);
}

function injectChatbotMarkup() {
  const wrapper = document.createElement('div');
  wrapper.id = 'campusai-chatbot';
  wrapper.innerHTML = `
    <!-- Floating Launcher -->
    <div class="chatbot-launcher pulse-glow" id="chat-launcher">
      <div class="chatbot-launcher-icon">
        <i class="fa-solid fa-robot"></i>
      </div>
      <span>Campus AI</span>
    </div>

    <!-- Chat Window Container -->
    <div class="chatbot-container" id="chat-container">
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="bot-avatar">
            <i class="fa-solid fa-brain"></i>
          </div>
          <div class="chat-header-text">
            <h3>CampusAI Assistant</h3>
            <span class="status-online"><span class="status-dot"></span> Online & Ready</span>
          </div>
        </div>
        <div class="chat-header-actions">
          <button class="chat-btn-icon" id="chat-clear-btn" title="Clear Conversation"><i class="fa-solid fa-rotate-right"></i></button>
          <button class="chat-btn-icon" id="chat-close-btn" title="Close"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>

      <div class="chat-messages" id="chat-messages"></div>

      <div class="quick-replies" id="chat-quick-replies"></div>

      <div class="chat-footer">
        <div class="chat-input-wrapper">
          <input type="text" id="chat-input" class="chat-input" placeholder="Ask anything about college, classes, attendance..." autocomplete="off">
          <button type="button" class="chat-voice-btn" id="chat-voice-btn" title="Voice Search"><i class="fa-solid fa-microphone"></i></button>
          <button type="button" class="chat-send-btn" id="chat-send-btn" title="Send"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);
}

function appendUserMessage(text) {
  const box = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerHTML = `<div class="message-content">${escapeHTML(text)}</div>`;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function appendBotMessage(markdownText) {
  const box = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = `
    <div class="bot-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; margin-top: 4px;">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="message-content">${formatMarkdown(markdownText)}</div>
  `;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

function showTypingIndicator() {
  const box = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot typing-wrapper';
  bubble.innerHTML = `
    <div class="bot-avatar" style="width: 28px; height: 28px; font-size: 0.8rem; margin-top: 4px;">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="message-content" style="padding: 6px 14px;">
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
  return bubble;
}

function renderQuickReplies(replies) {
  const container = document.getElementById('chat-quick-replies');
  container.innerHTML = '';
  replies.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => {
      document.getElementById('chat-input').value = text;
      document.getElementById('chat-send-btn').click();
    });
    container.appendChild(btn);
  });
}

function formatMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Client-Side NLP & Knowledge Intelligence Fallback
function processClientSideAI(query, user) {
  const q = query.toLowerCase();

  if (/hello|hi|hey|greetings|help|who are you/.test(q)) {
    return {
      reply: "Hello! 👋 I am **CampusAI**, your smart collegiate assistant.\n\nI can help you check attendance, timetable, assignments, exams, events, complaints, and campus facilities!",
      quickReplies: ["What's my attendance?", "Today's timetable", "Pending assignments", "Library timings", "Placement stats"]
    };
  }

  if (/attendance|absent|present|percentage/.test(q)) {
    return {
      reply: "📊 **Your Overall Attendance Summary**:\n\n• **Total Classes Held:** 24\n• **Classes Attended:** 21\n• **Attendance Rate:** **87.5%** 🎉\n\n✅ *You are well above the mandatory 75% threshold! Keep it up.*",
      quickReplies: ["Today's timetable", "Pending assignments", "Submit leave complaint"]
    };
  }

  if (/timetable|schedule|class|classes|routine|lecture/.test(q)) {
    return {
      reply: "📅 **Today's CS Semester 5 Schedule:**\n\n• **09:00 - 10:00**: Artificial Intelligence & Neural Nets (Lab 301)\n• **10:00 - 11:00**: Database Management Systems (Room 204)\n• **11:15 - 12:15**: Operating Systems & Concurrency (Room 204)\n• **13:00 - 14:30**: Cloud Computing Lab (Lab 102)",
      quickReplies: ["Pending assignments", "Upcoming events", "Contact professor"]
    };
  }

  if (/assignment|homework|submission|due date|deadline/.test(q)) {
    return {
      reply: "📝 **Active Assignments:**\n\n1. **Neural Network Implementation (CS501)** - Due: *Oct 05* [Graded: 94/100]\n2. **E-Commerce Schema & SQL (CS502)** - Due: *Oct 10* [Pending Submission]\n3. **Multithreaded Buffer Simulation (CS503)** - Due: *Oct 18* [Pending Submission]",
      quickReplies: ["Submit assignment", "Check grades", "Today's timetable"]
    };
  }

  if (/event|hackathon|fest|symposium|sports/.test(q)) {
    return {
      reply: "🎉 **Upcoming Campus Events:**\n\n• 🏆 **CampusAI Annual Hackathon 2026** (Oct 15) - 36hr AI sprint with $10k prizes\n• 🤖 **National AI & Robotics Symposium** (Oct 22) - Keynotes from AI researchers\n• 🏅 **Inter-College Sports Carnival** (Nov 02) - 30 Universities competing",
      quickReplies: ["Hackathon details", "Latest notices", "Library timings"]
    };
  }

  if (/library|books|borrow|timing|digital library/.test(q)) {
    return {
      reply: "📚 **Central Library Timings & Policies:**\n\n• **Weekdays:** 8:00 AM – 10:00 PM\n• **Weekends:** 9:00 AM – 6:00 PM\n• **Borrow Limit:** 5 books for 14 days\n• **Digital Access:** IEEE Xplore, ACM Digital Library & Springer available through campus Wi-Fi.",
      quickReplies: ["Fee structure", "Hostel facilities", "Admissions"]
    };
  }

  if (/fee|fees|tuition|scholarship|cost/.test(q)) {
    return {
      reply: "💳 **Fee Structure & Financial Aid:**\n\n• **Annual Tuition:** $4,500 / INR 1,20,000 per year\n• **Merit Scholarships:** Up to 50% tuition waiver for CGPA > 9.0\n• **Installments:** 2 equal semester installments allowed via student finance desk.",
      quickReplies: ["Hostel fee", "Admissions", "Check attendance"]
    };
  }

  if (/complaint|grievance|wifi|problem|issue/.test(q)) {
    return {
      reply: "🛠️ **Campus Grievance Redressal:**\n\nYou can file a complaint directly in the **Grievances tab** on your Student Dashboard. Administration addresses all queries within 24-48 hours.",
      quickReplies: ["File a complaint", "Check complaint status", "Today's schedule"]
    };
  }

  return {
    reply: `🤖 **CampusAI Assistant:**\n\nRegarding *"${query}"*: I've referenced our college knowledge base. You can browse specific details in the departments or ask me about **attendance, timetable, assignments, hostel, fees, library, or events**!`,
    quickReplies: ["What's my attendance?", "Today's timetable", "Active assignments", "Library timings"]
  };
}
