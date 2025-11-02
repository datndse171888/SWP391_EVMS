// src/pages/booking/DateTime.tsx
import React, { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import type { CreateAppointmentRequest } from '../../types/Appoitment'
import { formatDateTime } from '../../utils/DataFormat';
import { Input } from '../../components/ui/Input';
import { SlotTimeApi } from '../../api/SlotTimeApi';

interface DateTimeProps {
  formData: CreateAppointmentRequest;
  setFormData: React.Dispatch<React.SetStateAction<CreateAppointmentRequest>>;
  vehicleCategory?: 'CAR' | 'MOTOBIKE' | 'BICYCLE';
  onNext: () => void;
  onPrevious: () => void;
}

interface TimeSlot {
  time: string;
  value: string;
  available: boolean;
}

const DateTime: React.FC<DateTimeProps> = ({
  formData,
  setFormData,
  vehicleCategory = 'CAR',
  onNext,
  onPrevious
}) => {

  // ================================
  // UseStates & Variables
  // ================================

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [unavailableTimes, setUnavailableTimes] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);

  // Time slots from 07:00 to 20:00 (1-hour intervals)
  const timeSlots: TimeSlot[] = [
    { time: '07:00', value: '07:00:00', available: true },
    { time: '08:00', value: '08:00:00', available: true },
    { time: '09:00', value: '09:00:00', available: true },
    { time: '10:00', value: '10:00:00', available: true },
    { time: '11:00', value: '11:00:00', available: true },
    { time: '13:00', value: '13:00:00', available: true },
    { time: '14:00', value: '14:00:00', available: true },
    { time: '15:00', value: '15:00:00', available: true },
    { time: '16:00', value: '16:00:00', available: true }
  ];

  // ================================
  // UseEffects & Functions
  // ================================

  useEffect(() => {
    // Parse existing booking date if available
    if (formData.bookingDate) {
      try {
        const bookingDateTime = new Date(formData.bookingDate);
        const dateStr = bookingDateTime.toISOString().split('T')[0];
        const timeStr = bookingDateTime.toTimeString().split(' ')[0];

        setSelectedDate(dateStr);
        setSelectedTime(timeStr);
      } catch (error) {
        console.error('Error parsing booking date:', error);
      }
    }
  }, [formData.bookingDate]);

  useEffect(() => {
    if (selectedDate && vehicleCategory) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, vehicleCategory]);

  const fetchAvailableSlots = async (date: string) => {
    setIsLoadingSlots(true);
    try {
      console.log('[DateTime] Fetching slots for:', { date, vehicleCategory });
      const response = await SlotTimeApi.getAvailableSlotTimes({
        date: date,
        vehicleCategory: vehicleCategory
      });

      console.log('[DateTime] API Response:', response);
      console.log('[DateTime] Response data:', response.data);
      const availableSlotsData = response.data || [];
      console.log('[DateTime] Available slots count:', availableSlotsData.length);
      
      // Convert available slots to time strings
      const allTimeStrings = timeSlots.map(slot => slot.time); // ['07:00', '08:00', ...]
      const availableTimeStrings: string[] = [];

      allTimeStrings.forEach(timeSlot => {
        const [hour, minute] = timeSlot.split(':').map(Number);
        
        // Check if any available slot starts at this exact hour
        const hasMatchingSlot = availableSlotsData.some(slot => {
          try {
            const slotStartTime = new Date(slot.startTime);
            const slotYear = slotStartTime.getFullYear();
            const slotMonth = slotStartTime.getMonth();
            const slotDay = slotStartTime.getDate();
            const slotHour = slotStartTime.getHours();
            const slotMinute = slotStartTime.getMinutes();
            
            // Parse our date
            const [ourYear, ourMonth, ourDay] = date.split('-').map(Number);
            
            // Compare: same date AND same hour AND minute is 0
            const dateMatches = slotYear === ourYear && 
                              slotMonth === ourMonth - 1 && // Month is 0-indexed
                              slotDay === ourDay;
            const hourMatches = slotHour === hour && slotMinute === 0;
            
            const matches = dateMatches && hourMatches;
            
            // Debug first slot
            if (timeSlot === '07:00' && availableSlotsData.length > 0) {
              console.log(`[DateTime] Matching ${timeSlot}:`, {
                slotISO: slot.startTime,
                slotLocal: slotStartTime.toLocaleString('vi-VN'),
                slotDate: `${slotYear}-${slotMonth + 1}-${slotDay}`,
                ourDate: date,
                slotHour,
                ourHour: hour,
                dateMatches,
                hourMatches,
                matches
              });
            }
            
            return matches;
          } catch (error) {
            console.error(`[DateTime] Error parsing slot ${slot.startTime}:`, error);
            return false;
          }
        });

        if (hasMatchingSlot) {
          availableTimeStrings.push(timeSlot);
          console.log(`[DateTime] ✅ ${timeSlot} matched`);
        } else if (availableSlotsData.length > 0) {
          console.log(`[DateTime] ❌ ${timeSlot} no match`);
        }
      });

      setAvailableSlots(availableTimeStrings);
      
      // Find unavailable times (time slots not in available slots)
      const unavailable = allTimeStrings.filter(time => {
        return !availableTimeStrings.includes(time);
      });
      
      // Convert unavailable times to HH:mm:ss format
      const unavailableTimesFull = unavailable.map(time => `${time}:00`);
      setUnavailableTimes(unavailableTimesFull);

    } catch (error) {
      console.error('Error fetching available slot times:', error);
      setAvailableSlots([]);
      // Mark all slots as unavailable if API fails
      const allTimeStrings = timeSlots.map(slot => slot.time);
      const unavailableTimesFull = allTimeStrings.map(time => `${time}:00`);
      setUnavailableTimes(unavailableTimesFull);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // Allow booking up to 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  const isTimeAvailable = (timeValue: string): boolean => {
    if (!selectedDate || !vehicleCategory) return false;

    // Show loading state while fetching - disable all during loading
    if (isLoadingSlots) return false;

    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${timeValue}`);

    // Cannot select past times
    if (selectedDateTime <= now) return false;

    // Only allow slots that are explicitly in the available list from API
    if (availableSlots.length === 0) {
      return false; // No slots available from API
    }

    // Check if this time slot is in the available list
    const timeString = timeValue.split(':').slice(0, 2).join(':'); // Convert '07:00:00' to '07:00'
    if (!availableSlots.includes(timeString)) {
      return false; // Not in available list
    }

    // Cannot select if time is in unavailable list (double check)
    if (unavailableTimes.includes(timeValue)) return false;

    return true;
  };

  const getTimeSlotClassName = (timeValue: string): string => {
    const baseClasses = 'flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center';

    if (!selectedDate) {
      // No date selected - disabled state
      return `${baseClasses} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`;
    }

    if (!isTimeAvailable(timeValue)) {
      // Unavailable - disabled state
      return `${baseClasses} bg-red-50 border-red-200 text-red-400 cursor-not-allowed`;
    }

    if (selectedTime === timeValue) {
      // Selected state
      return `${baseClasses} bg-orange-500 border-orange-500 text-white shadow-lg transform scale-105`;
    }

    // Available state
    return `${baseClasses} bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600`;
  };

  // ================================
  // Handlers
  // ================================

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (timeValue: string) => {
    if (!selectedDate || !isTimeAvailable(timeValue)) return;

    setSelectedTime(timeValue);
  };

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert('Vui lòng chọn ngày và giờ');
      return;
    }

    // Create ISO string for bookingDate
    const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const bookingDateString = bookingDateTime.toISOString();

    setFormData(prev => ({
      ...prev,
      bookingDate: bookingDateString
    }));

    onNext();
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return '';

    const dateObj = new Date(`${selectedDate}T${selectedTime}`);
    return dateObj.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ================================
  // Render
  // ================================

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Chọn ngày & giờ</h2>
        <p className="text-gray-600">
          Chọn ngày và khung thời gian phù hợp cho cuộc hẹn của bạn
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-orange-500" />
            Chọn ngày
          </h3>

          <div className="bg-gray-50 p-6 rounded-lg border">
            {/* <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full p-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
            /> */}

            <Input
              type="date"
              name="bookingDate"
              label="Chọn ngày"
              value={selectedDate}
              onChange={handleDateChange}
              min={getMinDate()}
              max={getMaxDate()}
            />

            {selectedDate && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ngày đã chọn
                </h4>
                <p className="text-sm text-blue-700">
                  {formatDateTime(selectedDate).date}
                </p>
              </div>
            )}

            {/* Selected DateTime Summary */}
            {selectedDate && selectedTime && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Thời gian đã chọn
                </h4>
                <p className="text-green-700 text-sm">
                  {formatDateTime(`${selectedDate}T${selectedTime}`).time}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            Chọn giờ
          </h3>

          <div className="bg-gray-50 p-6 rounded-lg border">
            {!selectedDate ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Vui lòng chọn ngày trước</p>
              </div>
            ) : isLoadingSlots ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-spin" />
                <p>Đang tải khung giờ khả dụng...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => handleTimeSelect(slot.value)}
                    disabled={!isTimeAvailable(slot.value)}
                    className={`${getTimeSlotClassName(slot.value)} min-h-[60px]`}
                  >
                    <div className="w-full text-center">
                      <div className="font-semibold text-base">{slot.time}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded mr-2"></div>
              <span className="text-gray-600">Có thể chọn</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border-2 border-red-200 rounded mr-2"></div>
              <span className="text-gray-600">Không khả dụng</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 border-2 border-orange-500 rounded mr-2"></div>
              <span className="text-gray-600">Đã chọn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onPrevious}
        >
          Quay lại
        </Button>

        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={handleNext}
          disabled={!selectedDate || !selectedTime}
        >
          Tiếp theo
        </Button>
      </div>
    </>
  );
};

export default DateTime;