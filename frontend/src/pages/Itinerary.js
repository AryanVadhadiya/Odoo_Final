// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
// import { MapPin, Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';
// import { saveCurrentCity, clearBuilder } from '../store/slices/tripBuilderSlice';
// import { createTrip } from '../store/slices/tripSlice';
// import { toast } from 'react-hot-toast';

// const Itinerary = () => {
//   const { tripId } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { active, details, cities, currentCity } = useSelector((s) => s.tripBuilder || {});
//   // Deleted as per requirements
//           <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
//             <div className="mt-3">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">
//                 Add Destination
//               </h3>
//               <p className="text-sm text-gray-500 mb-4">
//                 This feature is coming soon!
//               </p>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowAddForm(false)}
//                   className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Itinerary; 