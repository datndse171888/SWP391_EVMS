import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

// Confirmation Modal Component
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            Xác nhận đặt lịch
                        </h3>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Bạn có chắc chắn muốn đặt lịch với thông tin đã cung cấp?
                        Sau khi xác nhận, bạn sẽ không thể thay đổi thông tin này.
                    </p>

                    <div className="flex justify-end space-x-3">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};