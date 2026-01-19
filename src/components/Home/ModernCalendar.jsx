import React, { useEffect, useState, useMemo } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { API_BASE } from "../../utils/constants";
import EventModal from "./EventModal";
import NoteEditor from "../Shared/NoteEditor";

export default function ModernCalendar() {
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [events, setEvents] = useState([]);
  const [dailyNotes, setDailyNotes] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedNoteDate, setSelectedNoteDate] = useState(null);
  const [showQuickAction, setShowQuickAction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle clicks outside dropdown
  useEffect(() => {
    if (!showQuickAction) return;

    const handleClickOutside = (e) => {
      // Check if click is outside any dropdown
      const dropdown = e.target.closest('[data-dropdown]');
      if (!dropdown) {
        setShowQuickAction(null);
      }
    };

    // Use setTimeout to ensure this runs after the current click that opened the menu
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuickAction]);

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const isCurrentMonth = date.getMonth() === currentMonth;
      const isToday = dateStr === today.toISOString().slice(0, 10);
      
      // Get events for this day
      const dayEvents = events.filter(e => {
        const eventStart = new Date(e.startDate + 'T00:00:00');
        const eventEnd = e.endDate ? new Date(e.endDate + 'T23:59:59') : new Date(e.startDate + 'T23:59:59');
        const currentDate = new Date(dateStr + 'T00:00:00');
        return currentDate >= eventStart && currentDate <= eventEnd;
      }).sort((a, b) => {
        // Sort by time if available, otherwise by title
        if (a.allDay && !b.allDay) return 1;
        if (!a.allDay && b.allDay) return -1;
        if (!a.allDay && !b.allDay) {
          return (a.startTime || '').localeCompare(b.startTime || '');
        }
        return a.title.localeCompare(b.title);
      });
      
      // Check if day has a note (title or content)
      const note = dailyNotes[dateStr];
      const hasNote = note && (note.title || note.content);
      
      days.push({
        date,
        dateStr,
        isCurrentMonth,
        isToday,
        dayNumber: date.getDate(),
        events: dayEvents,
        hasNote,
        noteTitle: note?.title || null,
        noteContent: note?.content || null
      });
    }
    
    return days;
  }, [currentMonth, currentYear, events, dailyNotes]);

  // Load events for current month (with buffer for multi-day events)
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Add buffer to catch events that start before or end after the month
        const bufferStart = new Date(firstDay);
        bufferStart.setDate(bufferStart.getDate() - 7);
        const bufferEnd = new Date(lastDay);
        bufferEnd.setDate(bufferEnd.getDate() + 7);
        
        const from = bufferStart.toISOString().slice(0, 10);
        const to = bufferEnd.toISOString().slice(0, 10);
        
        const res = await fetch(`${API_BASE}/api/events?from=${from}&to=${to}`);
        if (!res.ok) throw new Error('Failed to load events');
        const eventsData = await res.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentMonth, currentYear]);

  // Load daily notes for current month
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        const from = firstDay.toISOString().slice(0, 10);
        const to = lastDay.toISOString().slice(0, 10);
        
        const res = await fetch(`${API_BASE}/api/daily-notes?from=${from}&to=${to}`);
        if (!res.ok) throw new Error('Failed to load notes');
        const notes = await res.json();
        
        const notesMap = {};
        notes.forEach(note => {
          notesMap[note.date] = note;
        });
        setDailyNotes(notesMap);
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    };

    loadNotes();
  }, [currentMonth, currentYear]);

  const handleDayClick = (dateStr, e) => {
    // If clicking on note icon, open note editor
    if (e?.target?.closest('.note-icon')) {
      setSelectedNoteDate(dateStr);
      setSelectedDate(null);
      setSelectedEvent(null);
      setShowQuickAction(null);
      return;
    }
    
    // If clicking on event, don't handle here (handled by handleEventClick)
    if (e?.target?.closest('.event-item')) {
      return;
    }
    
    // Show quick action menu when clicking on a day
    setShowQuickAction(dateStr);
    setSelectedDate(null);
    setSelectedEvent(null);
    setSelectedNoteDate(null);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(null);
    setSelectedNoteDate(null);
    setShowQuickAction(null);
  };

  const handleNoteClick = (dateStr, e) => {
    e.stopPropagation();
    setSelectedNoteDate(dateStr);
    setSelectedDate(null);
    setSelectedEvent(null);
    setShowQuickAction(null);
  };

  const handleNoteSave = (savedNote) => {
    // If content and title are null/empty, it means the note was deleted
    if ((!savedNote.content || savedNote.content === '') && (!savedNote.title || savedNote.title === '')) {
      setDailyNotes(prev => {
        const updated = { ...prev };
        delete updated[savedNote.date];
        return updated;
      });
    } else {
      setDailyNotes(prev => ({
        ...prev,
        [savedNote.date]: savedNote
      }));
    }
    setSelectedNoteDate(null);
  };

  const handleQuickAction = (action, dateStr, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Close dropdown immediately
    setShowQuickAction(null);
    
    // Small delay to ensure dropdown closes, then open modal
    setTimeout(() => {
      if (action === 'event') {
        setSelectedDate(dateStr);
        setSelectedEvent(null);
        setSelectedNoteDate(null);
      } else if (action === 'note') {
        setSelectedNoteDate(dateStr);
        setSelectedDate(null);
        setSelectedEvent(null);
      }
    }, 100);
  };


  const handleEventSave = (savedEvent) => {
    if (selectedEvent && savedEvent.id === selectedEvent.id) {
      setEvents(prev => prev.map(e => e.id === savedEvent.id ? savedEvent : e));
    } else {
      setEvents(prev => [...prev, savedEvent]);
    }
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleEventDelete = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setSelectedEvent(null);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setSelectedDate(null);
    setSelectedNoteDate(null);
    setShowQuickAction(null);
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('calendar') || 'Calendar'}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="icon-btn"
            aria-label={t('previousMonth') || 'Previous month'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-neutral-light hover:text-primary-purple transition-colors"
          >
            {t('today') || 'Today'}
          </button>
          <button
            onClick={handleNextMonth}
            className="icon-btn"
            aria-label={t('nextMonth') || 'Next month'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card p-4">
        <div className="text-center mb-4 text-sm font-semibold text-gray-700 dark:text-neutral-light">
          {monthName}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {daysShort.map((day, idx) => (
            <div key={idx} className="text-center text-xs font-semibold text-gray-500 dark:text-neutral-light py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar Days */}
          {calendarDays.map((day, idx) => (
            <div
              key={idx}
              onClick={(e) => handleDayClick(day.dateStr, e)}
              className={`
                min-h-[120px] rounded-lg p-2 flex flex-col transition-all duration-200 cursor-pointer relative
                ${!day.isCurrentMonth 
                  ? 'text-gray-300 dark:text-neutral-medium opacity-40 bg-gray-50 dark:bg-[#2C2F3A]' 
                  : day.isToday
                  ? 'bg-primary-purple/10 dark:bg-primary-purple/10 border-2 border-primary-purple'
                  : 'bg-white dark:bg-[#353844] hover:bg-gray-50 dark:hover:bg-[#404550] border border-gray-200 dark:border-neutral-medium/30'
                }
              `}
              style={{ zIndex: showQuickAction === day.dateStr ? 60 : 'auto' }}
            >
              <div className="flex items-center justify-between mb-1 relative">
                <span className={`text-sm font-medium ${day.isToday ? 'text-primary-purple font-bold' : 'text-gray-700 dark:text-neutral-light'}`}>
                  {day.dayNumber}
                </span>
                <div className="flex items-center gap-1 relative">
                  {day.hasNote && (
                    <button
                      onClick={(e) => handleNoteClick(day.dateStr, e)}
                      className="note-icon p-0.5 hover:bg-gray-200 dark:hover:bg-[#404550] rounded transition-colors"
                      title={day.noteTitle || (day.noteContent ? day.noteContent.substring(0, 50) + (day.noteContent.length > 50 ? '...' : '') : '') || t('dailyNote') || 'Daily Note'}
                    >
                      <svg className="w-3.5 h-3.5 text-gray-600 dark:text-neutral-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                  {day.events.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-neutral-light">
                      {day.events.length}
                    </span>
                  )}
                  
                  {/* Quick Action Menu */}
                  {showQuickAction === day.dateStr && (
                    <div 
                      data-dropdown
                      className="absolute top-6 right-0 z-[50] bg-white dark:bg-[#2C2F3A] rounded-lg shadow-xl border border-gray-200 dark:border-neutral-medium/30 py-1 min-w-[160px]"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAction('event', day.dateStr, e);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-light hover:bg-gray-100 dark:hover:bg-[#353844] active:bg-gray-200 dark:active:bg-[#404550] transition-colors flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{t('addEvent') || 'Add Event'}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickAction('note', day.dateStr, e);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-neutral-light hover:bg-gray-100 dark:hover:bg-[#353844] active:bg-gray-200 dark:active:bg-[#404550] transition-colors flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{day.hasNote ? (t('editNote') || 'Edit Note') : (t('addNote') || 'Add Note')}</span>
                      </button>
                    </div>
                  )}
                </div>
                
              </div>
              
              {/* Events */}
              <div className="flex-1 space-y-1 overflow-y-auto">
                {day.events.slice(0, 4).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className="event-item text-xs px-2 py-1 rounded cursor-pointer hover:opacity-90 hover:shadow-sm transition-all font-medium truncate"
                    style={{ 
                      backgroundColor: event.color,
                      color: '#FFFFFF',
                      boxShadow: `0 1px 3px ${event.color}40`
                    }}
                    title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
                  >
                    {event.allDay || !event.startTime ? (
                      event.title
                    ) : (
                      <>
                        <span className="font-semibold">{event.startTime.slice(0, 5)}</span> {event.title}
                      </>
                    )}
                  </div>
                ))}
                {day.events.length > 4 && (
                  <div className="text-xs text-gray-500 dark:text-neutral-light px-2 py-1 text-center">
                    +{day.events.length - 4} {t('more') || 'more'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {(selectedEvent || selectedDate) && (
        <EventModal
          event={selectedEvent}
          date={selectedDate}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
          onClose={handleClose}
        />
      )}

      {/* Note Editor Modal */}
      {selectedNoteDate && (
        <NoteEditor
          date={selectedNoteDate}
          initialTitle={dailyNotes[selectedNoteDate]?.title || ""}
          initialContent={dailyNotes[selectedNoteDate]?.content || ""}
          onSave={handleNoteSave}
          onClose={() => {
            setSelectedNoteDate(null);
            setShowQuickAction(null);
          }}
        />
      )}

    </div>
  );
}

