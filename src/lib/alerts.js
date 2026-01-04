import Swal from "sweetalert2";

const sharedOptions = {
  buttonsStyling: false,
  backdrop: "rgba(8, 12, 20, 0.75)",
  customClass: {
    popup: "swal-popup",
    title: "swal-title",
    htmlContainer: "swal-text",
    confirmButton: "swal-confirm",
    cancelButton: "swal-cancel",
    backdrop: "swal-backdrop",
  },
};

export const swalBase = Swal.mixin(sharedOptions);

export const toast = Swal.mixin({
  ...sharedOptions,
  toast: true,
  position: "top",
  backdrop: false,
  background: "transparent",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  customClass: {
    ...sharedOptions.customClass,
    popup: "swal-toast",
    title: "swal-toast-title",
  },
});
