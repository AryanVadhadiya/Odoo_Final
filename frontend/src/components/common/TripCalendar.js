import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TripCalendar = ({ trips = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Get last day of month
  const lastDayOfMonth = new Date(currentYear, currentMonth, daysInMonth).getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', isEmpty: true });
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isEmpty: false });
    }
    
    // Add empty cells for days after the last day of the month
    for (let i = lastDayOfMonth + 1; i < 7; i++) {
      days.push({ day: '', isEmpty: true });
    }
    
    return days;
  }, [currentMonth, currentYear, firstDayOfMonth, lastDayOfMonth, daysInMonth]);

  // Get trips for a specific date
  const getTripsForDate = (day) => {
    if (!day || day.isEmpty) return [];
    
    const date = new Date(currentYear, currentMonth, day.day);
    return trips.filter(trip => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Get trip display text (shortened for calendar)
  const getTripDisplayText = (trip) => {
    if (trip.name.length <= 12) return trip.name;
    return trip.name.substring(0, 10) + '...';
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Calendar View</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-lg font-medium text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="card-body p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const tripsForDay = getTripsForDate(day);
            
            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 border border-gray-200 ${
                  day.isEmpty ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                {!day.isEmpty && (
                  <>
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {day.day}
                    </div>
                    {tripsForDay.length > 0 && (
                      <div className="space-y-1">
                        {tripsForDay.slice(0, 2).map((trip, tripIndex) => (
                          <div
                            key={trip._id || tripIndex}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded text-center truncate"
                            title={trip.name}
                          >
                            {getTripDisplayText(trip)}
                          </div>
                        ))}
                        {tripsForDay.length > 2 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{tripsForDay.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        {trips.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
            <div className="flex flex-wrap gap-2">
              {trips.slice(0, 3).map((trip) => (
                <div key={trip._id} className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span className="text-xs text-gray-600">{trip.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCalendar;
