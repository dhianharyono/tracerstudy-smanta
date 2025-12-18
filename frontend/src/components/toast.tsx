import { toast, ToastOptions } from 'react-toastify';

const Toast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const options: ToastOptions = {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        className: "rounded-lg text-sm font-sans mx-4 mt-4",
    };

    const toastTypes = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info,
    };

    const showToast = toastTypes[type] || toast.info;
    showToast(message, options);
};

export default Toast;