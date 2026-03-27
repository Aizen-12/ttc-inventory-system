import Swal from 'sweetalert2';

// Success alerts
export const showSuccess = (message, title = 'Success!') => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: message,
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true,
  });
};

// Error alerts
export const showError = (message, title = 'Error!') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#3B82F6',
  });
};

// Confirmation dialog
export const showConfirm = (message, title = 'Are you sure?') => {
  return Swal.fire({
    icon: 'warning',
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  });
};

// Loading
export const showLoading = (message = 'Processing...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close loading
export const closeLoading = () => {
  Swal.close();
};
