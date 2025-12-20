import { toast, ToastOptions } from 'react-toastify';

const Toast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    console.log(`Toast called: [${type}] ${message}`);
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
        style: { zIndex: 9999 }
    };

    switch (type) {
        case 'success':
            toast.success(message, options);
            break;
        case 'error':
            toast.error(message, options);
            break;
        case 'warning':
            toast.warning(message, options);
            break;
        default:
            toast.info(message, options);
    }
};

export default Toast;