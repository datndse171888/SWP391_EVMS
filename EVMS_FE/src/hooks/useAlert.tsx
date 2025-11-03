import { useState } from "react";
import { Alert, type AlertType } from "../components/Alert";

// Hook for easy usage
export const useAlert = () => {
  const [alert, setAlert] = useState<{
    type: AlertType;
    message: string;
    duration?: number;
    isVisible: boolean;
    onComplete?: () => void;
  } | null>(null);

  const showAlert = (
    type: AlertType,
    message: string,
    duration?: number,
    onComplete?: () => void
  ) => {
    setAlert({
      type,
      message,
      duration,
      isVisible: true,
      onComplete,
    });
  };

  const hideAlert = () => {
    setAlert(prev => prev ? { ...prev, isVisible: false } : null);
    if (alert?.onComplete) {
      alert.onComplete();
    }
  };

  const AlertComponent = alert ? (
    <Alert
      type={alert.type}
      message={alert.message}
      duration={alert.duration}
      isVisible={alert.isVisible}
      onClose={hideAlert}
    />
  ) : null;

  return {
    showAlert,
    hideAlert,
    AlertComponent
  };
};

export default Alert;