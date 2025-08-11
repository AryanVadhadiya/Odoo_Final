import React, { useMemo, useState } from 'react';
import { Calendar, DollarSign, Plus, MapPin } from 'lucide-react';

const defaultSections = [
  {
    id: 'sec-1',
    title: 'Arrival and Check-in',
    details: 'Arrive at destination, transfer to hotel, relax and explore nearby.',
    dateRange: { start: '2025-08-12', end: '2025-08-12' },
    budget: 120,
  },
  {
    id: 'sec-2',
    title: 'City Tour',
    details: 'Guided tour of key landmarks and local cuisine tasting.',
    dateRange: { start: '2025-08-13', end: '2025-08-13' },
    budget: 200,
  },
  {
    id: 'sec-3',
    title: 'Free Day / Activities',
    details: 'Choose from museums, parks, or shopping districts.',
    dateRange: { start: '2025-08-14', end: '2025-08-14' },
    budget: 80,
  },
];

const Itinerary = () => {
  const [sections, setSections] = useState(defaultSections);

  const totalBudget = useMemo(
    () => sections.reduce((sum, s) => sum + (Number(s.budget) || 0), 0),
    [sections]
  );

  const addSection = () => {
    const nextIndex = sections.length + 1;
    setSections([
      ...sections,
      {
        id: `sec-${nextIndex}`,
        title: `New Section ${nextIndex}`,
        details: 'Add details for this part of your trip...',
        dateRange: { start: '', end: '' },
        budget: 0,
      },
    ]);
  };

  const updateSection = (id, patch) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium mb-2">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            Itinerary
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Your Trip Itinerary</h1>
          <p className="text-gray-600">Organize your trip into clear sections with dates and budget.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Estimated Total Budget</div>
          <div className="text-xl font-semibold text-primary-700">${totalBudget.toFixed(2)}</div>
        </div>
      </div>

      {/* Sections list */}
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.id} className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                {/* Title + details */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <input
                    className="input"
                    placeholder="e.g., Day 1 - Arrival and Check-in"
                    value={s.title}
                    onChange={(e) => updateSection(s.id, { title: e.target.value })}
                  />
                  <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Details</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Add details of what you plan to do, where to go, notes, etc."
                    value={s.details}
                    onChange={(e) => updateSection(s.id, { details: e.target.value })}
                  />
                </div>

                {/* Date range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        className="input pl-9"
                        value={s.dateRange.start}
                        onChange={(e) => updateSection(s.id, { dateRange: { ...s.dateRange, start: e.target.value } })}
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        className="input pl-9"
                        min={s.dateRange.start || undefined}
                        value={s.dateRange.end}
                        onChange={(e) => updateSection(s.id, { dateRange: { ...s.dateRange, end: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      className="input pl-9"
                      placeholder="0.00"
                      value={s.budget}
                      onChange={(e) => updateSection(s.id, { budget: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={addSection} className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </button>
      </div>
    </div>
  );
};

export default Itinerary; 