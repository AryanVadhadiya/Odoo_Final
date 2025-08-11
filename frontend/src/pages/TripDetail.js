import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Share, Calendar, MapPin, DollarSign, AlertTriangle, TrendingUp, BarChart3, PieChart, Activity, Hotel, Car, Utensils, ShoppingBag, ChevronDown, ChevronUp, Clock, Plus, GripVertical } from 'lucide-react';
import { fetchTrip } from '../store/slices/tripSlice';
import { activityAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const TripDetail = () => {
  const { tripId } = useParams();
  const dispatch = useDispatch();
  const { currentTrip, tripLoading } = useSelector((state) => state.trips);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [expandedDays, setExpandedDays] = useState(new Set());
  const [draggedActivity, setDraggedActivity] = useState(null);
  const [draggedOverDay, setDraggedOverDay] = useState(null);

  useEffect(() => {
    if (tripId) {
      dispatch(fetchTrip(tripId));
      fetchActivities();
    }
  }, [dispatch, tripId]);

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await activityAPI.getActivities({ tripId });
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Calculate financial statistics
  const financialStats = useMemo(() => {
    if (!currentTrip) return {};

    const totalBudget = currentTrip.budget?.total || 0;
    const totalSpent = currentTrip.budget?.spent || 0;
    const remainingBudget = totalBudget - totalSpent;
    const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    // Calculate cost breakdown from activities and destinations
    const breakdown = {
      accommodation: 0,
      transportation: 0,
      activities: 0,
      food: 0,
      other: 0
    };

    // Add destination budgets
    currentTrip.destinations?.forEach(dest => {
      breakdown.accommodation += dest.hotel?.cost || 0;
      breakdown.transportation += dest.transportationCost || 0;
      breakdown.other += dest.budget || 0;
    });

    // Add activity costs
    activities.forEach(activity => {
      const cost = activity.cost?.amount || 0;
      if (activity.type === 'food') {
        breakdown.food += cost;
      } else if (activity.type === 'transport') {
        breakdown.transportation += cost;
      } else if (activity.type === 'sightseeing' || activity.type === 'adventure' || activity.type === 'culture') {
        breakdown.activities += cost;
      } else {
        breakdown.other += cost;
      }
    });

    // Calculate average cost per day
    const tripDuration = currentTrip.startDate && currentTrip.endDate ? 
      Math.ceil((new Date(currentTrip.endDate) - new Date(currentTrip.startDate)) / (1000 * 60 * 60 * 24)) : 0;
    const averageCostPerDay = tripDuration > 0 ? totalSpent / tripDuration : 0;

    // Check for over-budget days
    const overBudgetDays = [];
    if (currentTrip.destinations) {
      currentTrip.destinations.forEach(dest => {
        const destCost = (dest.hotel?.cost || 0) + (dest.transportationCost || 0) + (dest.budget || 0);
        const dailyBudget = totalBudget / tripDuration;
        if (destCost > dailyBudget * 2) { // Over 2x daily budget
          overBudgetDays.push({
            city: dest.city,
            date: dest.arrivalDate,
            cost: destCost,
            dailyBudget: dailyBudget
          });
        }
      });
    }

    return {
      totalBudget,
      totalSpent,
      remainingBudget,
      budgetUsage,
      breakdown,
      averageCostPerDay,
      overBudgetDays,
      tripDuration
    };
  }, [currentTrip, activities]);

  // Chart data for cost breakdown
  const chartData = useMemo(() => {
    const { breakdown } = financialStats;
    if (!breakdown) return [];

    return [
      { label: 'Accommodation', value: breakdown.accommodation, color: 'bg-blue-500', icon: Hotel },
      { label: 'Transportation', value: breakdown.transportation, color: 'bg-green-500', icon: Car },
      { label: 'Activities', value: breakdown.activities, color: 'bg-yellow-500', icon: Activity },
      { label: 'Food', value: breakdown.food, color: 'bg-red-500', icon: Utensils },
      { label: 'Other', value: breakdown.other, color: 'bg-purple-500', icon: ShoppingBag }
    ].filter(item => item.value > 0);
  }, [financialStats]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    if (!currentTrip?.startDate || !currentTrip?.endDate) return [];
    
    const start = new Date(currentTrip.startDate);
    const end = new Date(currentTrip.endDate);
    const days = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayActivities = activities.filter(activity => 
        activity.date === dateStr
      ).sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.startTime}:00`);
        const timeB = new Date(`2000-01-01T${b.startTime}:00`);
        return timeA - timeB;
      });
      
      days.push({
        date: new Date(d),
        dateStr,
        activities: dayActivities,
        destination: currentTrip.destinations?.find(dest => {
          const destStart = new Date(dest.arrivalDate);
          const destEnd = new Date(dest.departureDate);
          return d >= destStart && d <= destEnd;
        })
      });
    }
    
    return days;
  }, [currentTrip, activities]);

  // Toggle day expansion
  const toggleDayExpansion = (dateStr) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDays(newExpanded);
  };

  // Drag and drop handlers
  const handleDragStart = (e, activity) => {
    setDraggedActivity(activity);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dateStr) => {
    e.preventDefault();
    setDraggedOverDay(dateStr);
  };

  const handleDrop = async (e, targetDateStr) => {
    e.preventDefault();
    
    if (!draggedActivity || draggedActivity.date === targetDateStr) {
      setDraggedActivity(null);
      setDraggedOverDay(null);
      return;
    }

    try {
      // Calculate new time slots for the target day
      const targetDayActivities = calendarDays.find(day => day.dateStr === targetDateStr)?.activities || [];
      const newStartTime = calculateNewTimeSlot(targetDayActivities, draggedActivity.duration);
      
      // Update activity
      const updatedActivity = {
        ...draggedActivity,
        date: targetDateStr,
        startTime: newStartTime,
        endTime: calculateEndTime(newStartTime, draggedActivity.duration)
      };

      await activityAPI.updateActivity(draggedActivity._id, updatedActivity);
      
      // Update local state
      setActivities(prev => prev.map(act => 
        act._id === draggedActivity._id ? updatedActivity : act
      ));
      
      toast.success('Activity moved successfully!');
    } catch (error) {
      toast.error('Failed to move activity');
      console.error('Move activity error:', error);
    } finally {
      setDraggedActivity(null);
      setDraggedOverDay(null);
    }
  };

  // Calculate new time slot for dropped activity
  const calculateNewTimeSlot = (dayActivities, duration) => {
    if (dayActivities.length === 0) return '09:00';
    
    // Find gaps in the schedule
    const sortedActivities = dayActivities.sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.startTime}:00`);
      const timeB = new Date(`2000-01-01T${b.startTime}:00`);
      return timeA - timeB;
    });
    
    let currentTime = new Date('2000-01-01T09:00:00');
    
    for (const activity of sortedActivities) {
      const activityStart = new Date(`2000-01-01T${activity.startTime}:00`);
      const activityEnd = new Date(`2000-01-01T${activity.endTime}:00`);
      
      // Check if there's enough space before this activity
      const timeDiff = (activityStart - currentTime) / (1000 * 60); // in minutes
      if (timeDiff >= duration) {
        return currentTime.toTimeString().slice(0, 5);
      }
      
      // Move to after this activity
      currentTime = new Date(activityEnd);
    }
    
    // If no gaps, place at the end
    return currentTime.toTimeString().slice(0, 5);
  };

  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime, duration) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    return end.toTimeString().slice(0, 5);
  };

  // Quick edit activity
  const handleQuickEdit = async (activityId, field, value) => {
    try {
      const updatedActivity = { [field]: value };
      await activityAPI.updateActivity(activityId, updatedActivity);
      
      setActivities(prev => prev.map(act => 
        act._id === activityId ? { ...act, ...updatedActivity } : act
      ));
      
      toast.success('Activity updated!');
    } catch (error) {
      toast.error('Failed to update activity');
    }
  };

  // Simple Chart Components
  const PieChartComponent = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const angle = (percentage / 100) * 360;
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;
            
            // Calculate start and end angles
            const startAngle = index === 0 ? 0 : 
              data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
            const endAngle = startAngle + angle;
            
            // Convert to radians and calculate coordinates
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = 50 + radius * Math.cos(startRad);
            const y1 = 50 + radius * Math.sin(startRad);
            const x2 = 50 + radius * Math.cos(endRad);
            const y2 = 50 + radius * Math.sin(endRad);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            return (
              <g key={index}>
                <path
                  d={`M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color.replace('bg-', '')}
                  className="transition-all duration-300 hover:opacity-80"
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>
    );
  };

  const BarChartComponent = ({ data }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const Icon = item.icon;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{item.label}</span>
                </div>
                <span className="font-medium text-gray-900">${item.value.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const BudgetAlert = ({ alert }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Budget Alert</h4>
          <p className="text-sm text-red-700 mt-1">
            {alert.city} on {new Date(alert.date).toLocaleDateString()} is over budget.
          </p>
          <div className="mt-2 text-sm text-red-600">
            <span className="font-medium">Cost:</span> ${alert.cost.toLocaleString()} | 
            <span className="font-medium"> Daily Budget:</span> ${alert.dailyBudget.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );

  // Calendar View Component
  const CalendarView = () => (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Itinerary Calendar</h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop activities to reorder or move between days. Click on any field to edit inline.
            </p>
          </div>
          <button
            onClick={() => setShowCalendarView(false)}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Switch to Overview
          </button>
        </div>
      </div>
      <div className="card-body">
        {/* Drag and Drop Instructions */}
        {draggedActivity && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <GripVertical className="h-4 w-4" />
              <span className="text-sm font-medium">
                Dragging: {draggedActivity.title}
              </span>
              <span className="text-xs text-blue-600">
                Drop on a day to move this activity
              </span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {calendarDays.map((day, dayIndex) => (
            <div key={day.dateStr} className="relative">
              {/* Day Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-600">
                      {day.date.getDate()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {day.date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                {/* Destination Info */}
                {day.destination && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{day.destination.city}, {day.destination.country}</span>
                  </div>
                )}
                
                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleDayExpansion(day.dateStr)}
                  className="ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {expandedDays.has(day.dateStr) ? (
                    <ChevronUp className="h-5 w-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Drop Zone Indicator */}
                {draggedActivity && draggedOverDay === day.dateStr && (
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-500 animate-pulse"></div>
                )}
                
                {/* Activities */}
                <div className="space-y-3">
                  {day.activities.length > 0 ? (
                    day.activities.map((activity, activityIndex) => (
                      <div
                        key={activity._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, activity)}
                        onDragOver={(e) => handleDragOver(e, day.dateStr)}
                        onDrop={(e) => handleDrop(e, day.dateStr)}
                        className={`relative flex items-start space-x-4 p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                          draggedActivity?._id === activity._id ? 'opacity-50 scale-95' : ''
                        } ${draggedOverDay === day.dateStr ? 'ring-2 ring-primary-300 bg-primary-50' : ''}`}
                      >
                        {/* Time indicator */}
                        <div className="flex-shrink-0 w-12 text-center">
                          <div className="w-3 h-3 bg-primary-500 rounded-full mx-auto mb-1"></div>
                          <div className="space-y-1">
                            <input
                              type="time"
                              value={activity.startTime}
                              onChange={(e) => handleQuickEdit(activity._id, 'startTime', e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 w-full text-center hover:border-primary-300 focus:border-primary-500 focus:outline-none"
                            />
                            <input
                              type="time"
                              value={activity.endTime}
                              onChange={(e) => handleQuickEdit(activity._id, 'endTime', e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 w-full text-center hover:border-primary-300 focus:border-primary-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        
                        {/* Activity content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={activity.title}
                                onChange={(e) => handleQuickEdit(activity._id, 'title', e.target.value)}
                                className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5 w-full"
                                placeholder="Activity title"
                              />
                              {activity.description && (
                                <textarea
                                  value={activity.description}
                                  onChange={(e) => handleQuickEdit(activity._id, 'description', e.target.value)}
                                  className="text-sm text-gray-600 mt-1 bg-transparent border border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5 w-full resize-none"
                                  placeholder="Description"
                                  rows={2}
                                />
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                <select
                                  value={activity.type}
                                  onChange={(e) => handleQuickEdit(activity._id, 'type', e.target.value)}
                                  className="border border-gray-300 rounded px-2 py-1 bg-white hover:border-primary-300 focus:border-primary-500 focus:outline-none"
                                >
                                  <option value="sightseeing">Sightseeing</option>
                                  <option value="food">Food</option>
                                  <option value="adventure">Adventure</option>
                                  <option value="culture">Culture</option>
                                  <option value="shopping">Shopping</option>
                                  <option value="relaxation">Relaxation</option>
                                  <option value="transport">Transport</option>
                                  <option value="other">Other</option>
                                </select>
                                {activity.location?.name && (
                                  <span className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <input
                                      type="text"
                                      value={activity.location.name}
                                      onChange={(e) => handleQuickEdit(activity._id, 'location', { ...activity.location, name: e.target.value })}
                                      className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5 w-20"
                                    />
                                  </span>
                                )}
                                {activity.cost?.amount > 0 && (
                                  <span className="flex items-center">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    <input
                                      type="number"
                                      value={activity.cost.amount}
                                      onChange={(e) => handleQuickEdit(activity._id, 'cost', { ...activity.cost, amount: Number(e.target.value) })}
                                      className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5 w-16 text-center"
                                      min="0"
                                      step="0.01"
                                    />
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Drag handle */}
                            <div className="flex-shrink-0 ml-2">
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative flex items-start space-x-4 p-4">
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="w-3 h-3 bg-gray-300 rounded-full mx-auto mb-1"></div>
                      </div>
                      <div className="flex-1 text-center py-8">
                        <p className="text-gray-500">No activities planned for this day</p>
                        <button className="mt-2 text-sm text-primary-600 hover:text-primary-500">
                          <Plus className="h-4 w-4 inline mr-1" />
                          Add Activity
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Day View */}
              {expandedDays.has(day.dateStr) && (
                <div className="mt-4 ml-20 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Day Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Quick Add Activity</h5>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Activity title"
                          className="input text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            className="input text-sm"
                            placeholder="Start time"
                          />
                          <input
                            type="time"
                            className="input text-sm"
                            placeholder="End time"
                          />
                        </div>
                        <button className="btn-primary btn-sm w-full">
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </button>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Day Summary</h5>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Activities:</span>
                          <span className="font-medium">{day.activities.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Cost:</span>
                          <span className="font-medium">
                            ${day.activities.reduce((sum, act) => sum + (act.cost?.amount || 0), 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span className="font-medium">
                            {day.activities.reduce((sum, act) => sum + (act.duration || 0), 0)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h1>
          <p className="text-gray-600 mb-4">The trip you're looking for doesn't exist.</p>
          <Link to="/trips" className="btn-primary">Go Back to Trips</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/trips"
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentTrip.name}</h1>
            {currentTrip.description && (
              <p className="text-gray-600">{currentTrip.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn-secondary inline-flex items-center">
            <Share className="h-4 w-4 mr-2" />
            Share
          </button>
          <Link
            to={`/trips/${tripId}/edit`}
            className="btn-primary inline-flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Trip
          </Link>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setShowCalendarView(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showCalendarView
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setShowCalendarView(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showCalendarView
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Calendar View
          </button>
        </div>
      </div>

      {showCalendarView ? (
        <CalendarView />
      ) : (
        <>
          {/* Financial Overview */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-blue-100 text-sm">Total Budget</p>
                <p className="text-2xl font-bold">${financialStats.totalBudget?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm">Total Spent</p>
                <p className="text-2xl font-bold">${financialStats.totalSpent?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm">Remaining</p>
                <p className="text-2xl font-bold">${financialStats.remainingBudget?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-center">
                <p className="text-blue-100 text-sm">Usage</p>
                <p className="text-2xl font-bold">{financialStats.budgetUsage?.toFixed(1) || '0'}%</p>
              </div>
            </div>
          </div>

          {/* Budget Alerts */}
          {financialStats.overBudgetDays && financialStats.overBudgetDays.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Budget Alerts
              </h3>
              <div className="space-y-3">
                {financialStats.overBudgetDays.map((alert, index) => (
                  <BudgetAlert key={index} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip info */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-gray-900">Trip Information</h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {financialStats.tripDuration} days
                          {currentTrip.startDate && currentTrip.endDate && (
                            <span className="block text-xs text-gray-500">
                              {new Date(currentTrip.startDate).toLocaleDateString()} - {new Date(currentTrip.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Destinations</p>
                        <p className="text-sm text-gray-600">{currentTrip.destinations?.length || 0} {((currentTrip.destinations?.length || 0) === 1) ? 'city' : 'cities'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Average Cost/Day</p>
                        <p className="text-sm text-gray-600">${financialStats.averageCostPerDay?.toFixed(2) || '0'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-primary-600">P</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <p className="text-sm text-gray-600">{currentTrip.status ? (currentTrip.status.charAt(0).toUpperCase() + currentTrip.status.slice(1)) : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Charts */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-gray-900">Cost Breakdown</h2>
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-4 text-center">Pie Chart View</h3>
                      <PieChartComponent data={chartData} />
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-700 mb-4">Bar Chart View</h3>
                      <BarChartComponent data={chartData} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Itinerary preview */}
              <div className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
                    <Link
                      to={`/trips/${tripId}/itinerary`}
                      className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                    >
                      View Full Itinerary
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  <div className="space-y-2 text-sm text-gray-600">
                    {currentTrip.destinations?.length ? (
                      currentTrip.destinations.map((d, idx) => (
                        <div key={idx} className="border-l-4 border-primary-500 pl-4">
                          <h3 className="font-medium text-gray-900">{d.city}, {d.country}</h3>
                          <p className="text-sm text-gray-600 mt-1">{new Date(d.arrivalDate).toLocaleDateString()} - {new Date(d.departureDate).toLocaleDateString()}</p>
                          {d.budget > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              <DollarSign className="h-3 w-3 inline mr-1" />
                              Budget: ${d.budget.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No itinerary yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <Link
                      to={`/trips/${tripId}/itinerary`}
                      className="block w-full text-left p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <h4 className="font-medium text-gray-900">Edit Itinerary</h4>
                      <p className="text-sm text-gray-600">Add activities and destinations</p>
                    </Link>
                    <Link
                      to={`/trips/${tripId}/budget`}
                      className="block w-full text-left p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <h4 className="font-medium text-gray-900">Manage Budget</h4>
                      <p className="text-sm text-gray-600">Track expenses and costs</p>
                    </Link>
                    <button className="block w-full text-left p-3 rounded-md border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200">
                      <h4 className="font-medium text-gray-900">Share Trip</h4>
                      <p className="text-sm text-gray-600">Invite friends and family</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Trip stats */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Trip Stats</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Activities Planned</span>
                      <span className="text-sm font-medium text-gray-900">{activities.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Budget Used</span>
                      <span className="text-sm font-medium text-gray-900">
                        {financialStats.budgetUsage ? `${financialStats.budgetUsage.toFixed(1)}%` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Days Remaining</span>
                      <span className="text-sm font-medium text-gray-900">
                        {currentTrip.startDate && currentTrip.endDate ? 
                          Math.max(0, Math.ceil((new Date(currentTrip.endDate) - new Date()) / (1000 * 60 * 60 * 24))) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Cost/Day</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${financialStats.averageCostPerDay?.toFixed(2) || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget Summary */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Budget Summary</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Budget</span>
                      <span className="text-sm font-medium text-gray-900">${financialStats.totalBudget?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="text-sm font-medium text-gray-900">${financialStats.totalSpent?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className={`text-sm font-medium ${financialStats.remainingBudget < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        ${financialStats.remainingBudget?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${financialStats.budgetUsage > 100 ? 'bg-red-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(financialStats.budgetUsage || 0, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {financialStats.budgetUsage?.toFixed(1) || '0'}% of budget used
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TripDetail; 