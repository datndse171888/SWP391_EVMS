import React, { useEffect, useState } from 'react'
import type { VehicleRequest, VehicleResponse, VehicleType } from '../../types/Vehicle';
import { VehicleApi } from '../../api/VehicleApi';
import type { CheckingResponse } from '../../types/DataResponse';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Loading } from '../../components/Loading';
import { Select } from '../../components/ui/Select';

interface VehicleProps {
  formData: (_id: string) => void;
  onNext: () => void;
  // onPrevious?: () => void;
}

const Vehicle: React.FC<VehicleProps> = ({
  formData,
  onNext,
  // onPrevious 
}) => {

  // ================================
  // UseStates & Variables
  // ================================

  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]); // List of vehicles from API
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResponse | null>(null); // Selected vehicle
  const [newVehicleData, setNewVehicleData] = useState<VehicleRequest>({ // New vehicle form data
    VIN: '',
    vehicleType: 'electric_car',
    vehicleCategory: 'CAR',
    plateNumber: '',
    brand: '',
    year: new Date().getFullYear(),
    mileage: 0,
    batteryCapacity: 0,
    status: 'active'
  });

  // ================================
  // useState & Variables
  // ================================

  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [isCreating, setIsCreating] = useState<boolean>(false); // Creating new vehicle state
  const [showNewVehicleForm, setShowNewVehicleForm] = useState<boolean>(false); // Show new vehicle form

  const vehicleCategoryOptions = [
    { value: 'CAR', label: 'Ô tô điện' },
    { value: 'MOTOBIKE', label: 'Xe máy điện' },
    { value: 'BICYCLE', label: 'Xe đạp điện' }
  ];


  // ================================
  // UseEffects & CallAPIs
  // ================================

  useEffect(() => {
    getVehicleOfUser();
  }, []);

  const getVehicleOfUser = async () => {
    setIsLoading(true);
    try {
      const response = await VehicleApi.getAllVehiclesByToken();
      const data: CheckingResponse<VehicleResponse[]> = response.data;
      setVehicles(data.data || []);

      // Auto show new vehicle form if no vehicles
      if (!data.data || data.data.length === 0) {
        setShowNewVehicleForm(true);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setShowNewVehicleForm(true);
    } finally {
      setIsLoading(false);
    }
  };


  // ================================
  // Handlers & Functions
  // ================================

  const handleVehicleSelect = (vehicleId: string) => {
    if (vehicleId === 'new') {
      setSelectedVehicle(null);
      setShowNewVehicleForm(true);
    } else {
      const vehicle = vehicles.find(v => v._id === vehicleId);
      setSelectedVehicle(vehicle || null);
      setShowNewVehicleForm(false);
    }
  };

  const handleNewVehicleChange = (field: keyof VehicleRequest, value: any) => {
    setNewVehicleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isNewVehicleValid = () => {
    return newVehicleData.VIN.trim() !== '' &&
      newVehicleData.plateNumber.trim() !== '' &&
      newVehicleData.brand.trim() !== '' &&
      newVehicleData.year > 1900 &&
      newVehicleData.mileage >= 0 &&
      newVehicleData.batteryCapacity > 0;
  };

  const createNewVehicle = async () => {
    if (!isNewVehicleValid()) {
      alert('Vui lòng điền đầy đủ thông tin xe');
      return null;
    }

    setIsCreating(true);
    try {
      const response = await VehicleApi.createVehicle(newVehicleData);
      const data: CheckingResponse<VehicleResponse> = response.data;

      if (data.success && data.data) {
        // Add new vehicle to list
        setVehicles(prev => [...prev, data.data]);
        return data.data._id;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating vehicle:', error);
      alert(error.response?.data?.message || 'Không thể tạo xe mới');
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const handleNext = async () => {
    let vehicleId: string | null = null;

    if (selectedVehicle) {
      // Use existing vehicle
      vehicleId = selectedVehicle._id;
    } else if (showNewVehicleForm && isNewVehicleValid()) {
      // Create new vehicle
      vehicleId = await createNewVehicle();
    }

    if (vehicleId) {
      formData(vehicleId);
      onNext();
    } else {
      alert('Vui lòng chọn xe hoặc điền đầy đủ thông tin xe mới');
    }
  };

  const getDisplayValue = () => {
    if (selectedVehicle) {
      return selectedVehicle._id;
    } else if (showNewVehicleForm) {
      return 'new';
    }
    return '';
  };

  // ================================
  // Render
  // ================================

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Thông tin xe</h2>
        <p className="text-gray-600 mb-6">
          Chọn xe có sẵn hoặc thêm xe mới để tiếp tục đặt lịch dịch vụ
        </p>
      </div>

      {/* Vehicle Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Chọn xe của bạn</h3>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="mb-6">
            <Select
              name="vehicle"
              label="Xe của bạn"
              value={getDisplayValue()}
              onChange={(e) => handleVehicleSelect(e.target.value)}
              option={[
                ...vehicles.map((vehicle) => ({
                  value: vehicle._id,
                  label: `${vehicle.brand} - ${vehicle.plateNumber} (${vehicle.year})`
                })),
                { value: 'new', label: '+ Thêm xe mới' }
              ]}
            />
          </div>
        )}

        {/* Vehicle Information Form */}
        <div className="p-6 bg-gray-50 rounded-lg border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedVehicle ? 'Thông tin xe đã chọn' : 'Thông tin xe mới'}
          </h4>

          <div className="grid md:grid-cols-2 gap-6">
            {/* VIN */}
            <div>
              <Input
                id="VIN"
                name="VIN"
                type="text"
                label="Số VIN"
                value={selectedVehicle?.VIN || newVehicleData.VIN}
                onChange={(e) => !selectedVehicle && handleNewVehicleChange('VIN', e.target.value)}
                disabled={!!selectedVehicle}
                required={!selectedVehicle}
                placeholder="Nhập số VIN (17 ký tự)"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <Select
              name="vehicleType"
              label="Loại xe"
              value={selectedVehicle?.vehicleType || newVehicleData.vehicleType}
              onChange={(e) => !selectedVehicle && handleNewVehicleChange('vehicleType', e.target.value as VehicleType)}
              disabled={!!selectedVehicle}
              option={vehicleCategoryOptions}
              />
            </div>

            {/* Plate Number */}
            <div>
              <Input
                id="plateNumber"
                name="plateNumber"
                type="text"
                label="Biển số xe"
                value={selectedVehicle?.plateNumber || newVehicleData.plateNumber}
                onChange={(e) => !selectedVehicle && handleNewVehicleChange('plateNumber', e.target.value)}
                disabled={!!selectedVehicle}
                required={!selectedVehicle}
                placeholder="VD: 30A-12345"
              />
            </div>

            {/* Brand */}
            <div>
              <Input
                id="brand"
                name="brand"
                type="text"
                label="Thương hiệu"
                value={selectedVehicle?.brand || newVehicleData.brand}
                onChange={(e) => !selectedVehicle && handleNewVehicleChange('brand', e.target.value)}
                disabled={!!selectedVehicle}
                required={!selectedVehicle}
                placeholder="VD: VinFast, Tesla"
              />
            </div>

            {/* Year */}
            <div>
              <Input
                id="year"
                name="year"
                type="number"
                label="Năm sản xuất"
                value={selectedVehicle?.year?.toString() || newVehicleData.year.toString()}
                onChange={(e) => !selectedVehicle && handleNewVehicleChange('year', parseInt(e.target.value) || 0)}
                disabled={!!selectedVehicle}
                required={!selectedVehicle}
                placeholder={`VD: ${new Date().getFullYear()}`}
              />
            </div>

            {/* Mileage */}
            <div>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                label="Số km đã đi"
                value={selectedVehicle?.mileage?.toString() || newVehicleData.mileage.toString()}
                onChange={(e) => !selectedVehicle && handleNewVehicleChange('mileage', parseInt(e.target.value) || 0)}
                disabled={!!selectedVehicle}
                required={!selectedVehicle}
                placeholder="VD: 15000"
              />
            </div>

            {/* Battery Capacity */}
            <div>
              <Input
                id="batteryCapacity"
                name="batteryCapacity"
                type="number"
                label="Dung lượng pin (kWh)"
                value={selectedVehicle?.batteryCapacity?.toString() || newVehicleData.batteryCapacity.toString()}
                onChange={(e) => !selectedVehicle && handleNewVehicleChange('batteryCapacity', parseFloat(e.target.value) || 0)}
                disabled={!!selectedVehicle}
                required={!selectedVehicle}
                placeholder="VD: 50"
              />
            </div>

            {/* Status - only for existing vehicles */}
            {selectedVehicle && (
              <div>
                <Input
                  id="status"
                  name="status"
                  type="text"
                  label="Trạng thái"
                  value={selectedVehicle.status}
                  disabled={true}
                />
              </div>
            )}
          </div>

          {/* New Vehicle Validation Message */}
          {showNewVehicleForm && !selectedVehicle && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Lưu ý:</span> Xe sẽ được tạo tự động khi bạn nhấn "Tiếp theo"
              </p>
              {!isNewVehicleValid() && (
                <p className="text-sm text-red-600 mt-1">
                  Vui lòng điền đầy đủ thông tin có dấu (*)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        {/* {onPrevious && (
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={onPrevious}
          >
            Quay lại
          </Button>
        )} */}
        <Button
          variant="primary"
          size="sm"
          type="button"
          onClick={handleNext}
          disabled={isCreating || (!selectedVehicle && (!showNewVehicleForm || !isNewVehicleValid()))}
        >
          {isCreating ? 'Đang tạo xe...' : 'Tiếp theo'}
        </Button>
      </div>
    </div>
  );
};

export default Vehicle;