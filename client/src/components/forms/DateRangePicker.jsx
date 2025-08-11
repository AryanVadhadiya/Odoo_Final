import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, isAfter, startOfWeek, endOfWeek } from 'date-fns';

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  minDate,
  maxDate,
  disabled = false,
  className = '',
  placeholder = 'Select date range',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startDate || new Date());
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);
  
  const containerRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        resetTempDates();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (startDate) {
      setCurrentMonth(startDate);
      setTempStartDate(startDate);
    }
    if (endDate) {
      setTempEndDate(endDate);
    }
  }, [startDate, endDate]);

  const resetTempDates = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsSelectingEnd(false);
  };

  const handleDateClick = (date) => {
    if (disabled) return;
    
    if (!isSelectingEnd) {
      // Start selecting end date
      setTempStartDate(date);
      setIsSelectingEnd(true);
    } else {
      // Complete the range
      if (isBefore(date, tempStartDate)) {
        // If end date is before start date, swap them
        setTempStartDate(date);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(date);
      }
      
      // Apply the selection
      onDateChange?.(tempStartDate, date);
      setIsOpen(false);
      setIsSelectingEnd(false);
    }
  };

  const handleClear = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onDateChange?.(null, null);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    if (!tempStartDate) {
      setTempStartDate(today);
      setIsSelectingEnd(true);
    }
  };

  const isDateInRange = (date) => {
    if (!tempStartDate || !tempEndDate) return false;
    return isAfter(date, tempStartDate) && isBefore(date, tempEndDate);
  };

  const isDateSelected = (date) => {
    return (tempStartDate && isSameDay(date, tempStartDate)) ||
           (tempEndDate && isSameDay(date, tempEndDate));
  };

  const isDateDisabled = (date) => {
    if (minDate && isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const formatDisplayValue = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
    }
    if (startDate) {
      return `${format(startDate, 'MMM dd, yyyy')} - Select end date`;
    }
    return placeholder;
  };

  const calendarDays = getCalendarDays();

  return (
    <div className={`relative ${className}`} ref={containerRef} {...props}>
      {/* Input Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-3 text-left
          bg-white border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-midnight focus:border-midnight
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${startDate && endDate ? 'border-midnight' : 'border-gray-300'}
          ${isOpen ? 'border-midnight ring-2 ring-midnight' : ''}
        `}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Select date range"
      >
        <span className={`${startDate && endDate ? 'text-gray-900' : 'text-gray-500'}`}>
          {formatDisplayValue()}
        </span>
        <div className="flex items-center space-x-2">
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-midnight rounded"
              aria-label="Clear date range"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
      </button>

      {/* Calendar Popup */}
      {isOpen && (
        <div
          ref={calendarRef}
          className="absolute z-50 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-label="Date range picker"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-midnight rounded"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-midnight rounded"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <div className="px-4 py-2 border-b border-gray-200">
            <button
              type="button"
              onClick={goToToday}
              className="text-sm text-midnight hover:text-ocean focus:outline-none focus:ring-2 focus:ring-midnight rounded px-2 py-1"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const isSelected = isDateSelected(day);
                const isInRange = isDateInRange(day);
                const isDisabled = isDateDisabled(day);
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`
                      w-10 h-10 text-sm rounded-lg transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-midnight focus:ring-offset-1
                      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isTodayDate ? 'font-bold' : ''}
                      ${isSelected ? 'bg-midnight text-white' : ''}
                      ${isInRange ? 'bg-midnight/10 text-midnight' : ''}
                      ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                      ${!isCurrentMonth ? 'cursor-default' : ''}
                    `}
                    aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}${isSelected ? ' (selected)' : ''}`}
                    aria-selected={isSelected}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection Status */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="text-sm text-gray-600">
              {!tempStartDate ? (
                'Click to select start date'
              ) : !tempEndDate ? (
                `Start: ${format(tempStartDate, 'MMM dd, yyyy')} - Click to select end date`
              ) : (
                `${format(tempStartDate, 'MMM dd, yyyy')} - ${format(tempEndDate, 'MMM dd, yyyy')}`
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker; 